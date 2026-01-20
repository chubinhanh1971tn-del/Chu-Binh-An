import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { PropertyService } from '../../services/property.service';
import { Property } from '../../models/property.model';
import { CommunityMapModalComponent } from '../community-map-modal/community-map-modal.component';

interface CommunityGroup {
  key: string; // Key to match property.group
  name: string;
  description: string;
  imageUrl: string;
  memberCount: number;
  joinLink: string;
  leader: string;
}

@Component({
  selector: 'app-community-hub',
  standalone: true,
  templateUrl: './community-hub.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeaderComponent, FooterComponent, CommunityMapModalComponent],
})
export class CommunityHubComponent {
  private propertyService = inject(PropertyService);
  private allProperties = this.propertyService.getProperties();

  selectedGroupForMap = signal<CommunityGroup | null>(null);

  readonly groups: CommunityGroup[] = [
    {
      key: 'Sông Công',
      name: 'Nhóm Đầu Tư Đất Nền Sông Công',
      description: 'Cùng nhau phân tích và chia sẻ cơ hội đầu tư đất nền tại khu vực Sông Công và các KCN lân cận.',
      imageUrl: 'https://picsum.photos/seed/songcong/800/600',
      memberCount: 128,
      joinLink: 'https://zalo.me/g/mga365', // Placeholder link
      leader: 'Nguyễn Văn Hùng',
    },
    {
      key: 'Nhóm A',
      name: 'Hội Mua Bán Nhà Phố Trung Tâm',
      description: 'Dành cho các thành viên quan tâm đến nhà mặt phố, nhà trong ngõ khu vực trung tâm TP. Thái Nguyên. Chia sẻ kinh nghiệm, giá cả.',
      imageUrl: 'https://picsum.photos/seed/nhapho/800/600',
      memberCount: 256,
      joinLink: 'https://zalo.me/g/mga365', // Placeholder link
      leader: 'Trưởng Nhóm A',
    },
    {
      key: 'Nhóm B',
      name: 'Cộng Đồng Chung Cư Tecco',
      description: 'Nơi giao lưu, chia sẻ thông tin mua bán, cho thuê và kinh nghiệm sống tại các dự án chung cư Tecco ở Thái Nguyên.',
      imageUrl: 'https://picsum.photos/seed/tecco/800/600',
      memberCount: 312,
      joinLink: 'https://zalo.me/g/mga365', // Placeholder link
      leader: 'Phạm Thị Dung',
    },
    {
      key: 'Shipper',
      name: 'Cộng Đồng Giao Hàng (Shipper)',
      description: 'Kết nối các tài xế giao hàng tại Thái Nguyên. Chia sẻ thông tin, hỗ trợ lẫn nhau và tối ưu hóa lộ trình để tăng hiệu quả công việc.',
      imageUrl: 'https://picsum.photos/seed/shipper/800/600',
      memberCount: 78,
      joinLink: 'https://zalo.me/g/mga365',
      leader: 'Trần Văn An',
    },
    {
      key: 'AEX',
      name: 'Cộng Đồng Xe Tự Lái AEX',
      description: 'Chỉ 2 năm nữa, những phương tiện tự lái do chính Mèo AI điều khiển sẽ là tương lai của vận tải Thái Nguyên. Đây là "ngôi nhà" của những người tiên phong, cùng chúng tôi kiến tạo cuộc cách mạng đó.',
      imageUrl: 'https://picsum.photos/seed/selfdriving/800/600',
      memberCount: 12,
      joinLink: 'https://zalo.me/g/mga365',
      leader: 'Mèo AI',
    },
  ];

  propertiesForSelectedGroup = computed(() => {
    const selectedGroup = this.selectedGroupForMap();
    if (!selectedGroup) {
      return [];
    }
    return this.allProperties().filter(p => p.group === selectedGroup.key);
  });

  openMapForGroup(group: CommunityGroup) {
    this.selectedGroupForMap.set(group);
  }

  closeMapModal() {
    this.selectedGroupForMap.set(null);
  }
}
