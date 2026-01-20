import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

interface MarketingChannel {
  name: string;
  logoUrl: string;
  description: string;
  proTip: string;
  link: string;
}

@Component({
  selector: 'app-marketing-channels',
  standalone: true,
  templateUrl: './marketing-channels.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeaderComponent, FooterComponent],
})
export class MarketingChannelsComponent {
  readonly socialChannels: MarketingChannel[] = [
    {
      name: 'Facebook Marketplace & Groups',
      logoUrl: 'https://i.imgur.com/2pAY6h1.png',
      description: 'Nền tảng tiếp cận người dùng địa phương cực kỳ hiệu quả. Marketplace dành cho các tin đăng cá nhân, trong khi các Group (nhóm) là nơi xây dựng cộng đồng và uy tín.',
      proTip: 'Hãy tham gia các nhóm BĐS tại Thái Nguyên, chia sẻ các phân tích giá trị từ trang "Phân Tích TT" để xây dựng thương hiệu cá nhân trước khi đăng bài bán hàng.',
      link: 'https://www.facebook.com/marketplace/category/propertyforsale'
    },
    {
      name: 'Zalo',
      logoUrl: 'https://i.imgur.com/gO0A21E.png',
      description: 'Là kênh giao tiếp và chăm sóc khách hàng 1-1 hiệu quả nhất tại Việt Nam. Sử dụng Zalo để gửi thông tin chi tiết, hình ảnh và duy trì mối quan hệ với khách hàng tiềm năng.',
      proTip: 'Tạo Zalo Official Account cho thương hiệu Thainguyen365 hoặc thương hiệu cá nhân của bạn để gửi các cập nhật thị trường và tin đăng mới một cách chuyên nghiệp.',
      link: 'https://chat.zalo.me'
    }
  ];

  readonly videoChannels: MarketingChannel[] = [
    {
      name: 'YouTube',
      logoUrl: 'https://i.imgur.com/kU3A8y2.png',
      description: 'Nền tảng tốt nhất cho các video chuyên sâu, đánh giá chi tiết dự án, hoặc các video phân tích thị trường dài. Xây dựng một kênh YouTube uy tín sẽ thu hút các nhà đầu tư nghiêm túc.',
      proTip: 'Tạo các video "review" một khu vực, phân tích ưu/nhược điểm thay vì chỉ đăng video về một bất động sản. Điều này sẽ tăng uy tín và thu hút người đăng ký.',
      link: 'https://www.youtube.com'
    },
    {
      name: 'TikTok',
      logoUrl: 'https://i.imgur.com/2s4z5Ym.png',
      description: 'Kênh mạnh mẽ nhất để tiếp cận lượng lớn người xem trong thời gian ngắn thông qua các video ngắn, sáng tạo. Rất phù hợp để xây dựng thương hiệu cá nhân một cách nhanh chóng.',
      proTip: 'Làm các video ngắn (dưới 60 giây) theo trend, ví dụ: "3 điều cần biết khi mua đất ở Sông Công", "Căn nhà có view đẹp nhất Thái Nguyên hôm nay". Sự sáng tạo là không giới hạn.',
      link: 'https://www.tiktok.com'
    }
  ];
}
