import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { PropertyService } from '../../services/property.service';
import { Property, PropertyType } from '../../models/property.model';
import { LineChartComponent } from '../line-chart/line-chart.component';

interface RegionStat {
  name: string;
  propertyCount: number;
  averagePricePerSqm: number;
  priceChange30d: number; // percentage
}

@Component({
  selector: 'app-market-analysis',
  standalone: true,
  templateUrl: './market-analysis.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeaderComponent, FooterComponent, LineChartComponent],
})
export class MarketAnalysisComponent {
  private propertyService = inject(PropertyService);
  private allProperties = this.propertyService.getProperties();

  activeType = signal<'all' | PropertyType>('all');

  // A mock list of major events for the timeline
  readonly mockNews = [
    { date: 'Tháng 10, 2024', title: 'Thái Nguyên công bố quy hoạch KĐT mới phía Tây', description: 'Quy hoạch mới dự kiến thu hút đầu tư và làm tăng giá trị đất nền khu vực lân cận.' },
    { date: 'Tháng 08, 2024', title: 'Hoàn thành mở rộng QL3', description: 'Tuyến đường huyết mạch hoàn thành giúp giảm tải giao thông và tăng kết nối, tác động tích cực đến BĐS dọc tuyến.' },
    { date: 'Tháng 05, 2024', title: 'Khởi công KCN Sông Công II', description: 'Dự án KCN mới hứa hẹn thu hút lượng lớn lao động, kéo theo nhu cầu về nhà ở và dịch vụ.' },
    { date: 'Tháng 01, 2024', title: 'Vincom Plaza mở rộng', description: 'Trung tâm thương mại lớn nhất được mở rộng, tăng tiện ích và sức hấp dẫn cho khu vực trung tâm.' },
  ];
  
  // Extract a simplified region name from the address
  private getRegionFromAddress(address: string): string {
    const parts = address.split(',').map(p => p.trim());
    // Prioritize Phường/Xã if available
    const ward = parts.find(p => p.startsWith('Phường') || p.startsWith('Xã'));
    if (ward) return ward;
    // Fallback to Huyện/TP
    const district = parts.find(p => p.startsWith('Huyện') || p.startsWith('TP.'));
    if (district) return district;
    return 'Khu vực khác';
  }

  // Compute stats for "Dynamic Regions"
  regionalStats = computed<RegionStat[]>(() => {
    const properties = this.allProperties().filter(p => p.listingType === 'Bán' && p.price > 0 && p.area > 0);
    const regions = new Map<string, Property[]>();

    // Group properties by region
    for (const prop of properties) {
      const regionName = this.getRegionFromAddress(prop.address);
      if (!regions.has(regionName)) {
        regions.set(regionName, []);
      }
      regions.get(regionName)!.push(prop);
    }

    const stats: RegionStat[] = [];
    for (const [name, props] of regions.entries()) {
      const avgPricePerSqm = props.reduce((sum, p) => sum + (p.price / p.area), 0) / props.length;
      
      // Calculate price change
      const recentProps = props.filter(p => p.priceHistory && p.priceHistory.length > 1);
      let totalChange = 0;
      if (recentProps.length > 0) {
        const avgChange = recentProps.reduce((sum, p) => {
          const history = p.priceHistory!;
          const latestPrice = history[history.length - 1].price;
          const prevPrice = history[history.length - 2].price;
          return sum + ((latestPrice - prevPrice) / prevPrice);
        }, 0) / recentProps.length;
        totalChange = avgChange * 100;
      }

      stats.push({
        name,
        propertyCount: props.length,
        averagePricePerSqm: avgPricePerSqm,
        priceChange30d: totalChange,
      });
    }

    // Sort by most active regions first
    return stats.sort((a, b) => b.propertyCount - a.propertyCount);
  });

  // Compute data for "Market Trend Chart"
  marketTrendData = computed<{ date: Date; value: number }[]>(() => {
    const priceHistoryData: { date: Date; pricePerSqm: number }[] = [];
    this.allProperties().forEach(prop => {
        // Only include properties for sale with valid data
        if (prop.priceHistory && prop.listingType === 'Bán' && prop.area > 0) {
            prop.priceHistory.forEach(historyPoint => {
                priceHistoryData.push({
                    date: new Date(historyPoint.date),
                    pricePerSqm: historyPoint.price / prop.area
                });
            });
        }
    });

    if (priceHistoryData.length === 0) return [];

    // Group by month to calculate average
    const monthlyData = new Map<string, { sum: number; count: number }>();
    priceHistoryData.forEach(item => {
        const monthKey = `${item.date.getFullYear()}-${item.date.getMonth()}`; // YYYY-M
        if (!monthlyData.has(monthKey)) {
            monthlyData.set(monthKey, { sum: 0, count: 0 });
        }
        const month = monthlyData.get(monthKey)!;
        month.sum += item.pricePerSqm;
        month.count++;
    });

    // Format data for the chart component
    const chartData: { date: Date; value: number }[] = [];
    monthlyData.forEach((data, key) => {
        const [year, month] = key.split('-').map(Number);
        chartData.push({
            date: new Date(year, month),
            value: data.sum / data.count // average price per sqm for that month
        });
    });
    
    // Sort by date chronologically
    return chartData.sort((a, b) => a.date.getTime() - b.date.getTime());
  });
}