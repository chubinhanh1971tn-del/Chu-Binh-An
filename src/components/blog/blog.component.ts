import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { RouterLink } from '@angular/router';

interface Article {
  link: string;
  imageUrl: string;
  category: string;
  title: string;
  summary: string;
}

@Component({
  selector: 'app-blog',
  standalone: true,
  templateUrl: './blog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeaderComponent, FooterComponent, RouterLink],
})
export class BlogComponent {
  readonly articles: Article[] = [
    {
      link: '/doussing',
      imageUrl: 'https://picsum.photos/seed/blog1/600/400',
      category: 'Phân Tích Quy Hoạch',
      title: "Doussing: 'Định Vị' Lại Tư Duy Quy Hoạch Đô Thị",
      summary: "Thị trường không chỉ là các con số. Nó là những dòng chảy, những mạch ngầm bị lãng quên. 'Doussing' là phương pháp luận của MGA365 để tìm lại những giá trị bị san lấp, bảo vệ lợi ích cộng đồng trước những rủi ro quy hoạch vô hình. Hãy cùng xem case study điển hình tại KDC số 5 và nút giao Minh Cầu."
    },
    {
      link: '/cooperation',
      imageUrl: 'https://picsum.photos/seed/blog2/600/400',
      category: 'Triết Lý MGA365',
      title: "Cơ Chế Hợp Tác 1%: Xây Dựng 'Liên Minh Minh Bạch'",
      summary: "Tại sao lại là 1%? Chúng tôi tin rằng thành công bền vững đến từ sự chia sẻ công bằng. Khám phá triết lý 'Tư vấn & Trao quyền' và cơ chế hợp tác 50/50, nền tảng xây dựng nên Liên Minh Minh Bạch, nơi mỗi Cố Vấn là một đối tác bình đẳng."
    },
    {
      link: '/market-analysis',
      imageUrl: 'https://picsum.photos/seed/blog3/600/400',
      category: 'Phân Tích Thị Trường',
      title: 'Phân Tích Chu Kỳ & Nguyên Nhân Tăng Trưởng BĐS Thái Nguyên',
      summary: "Thị trường BĐS Thái Nguyên đang ở giai đoạn nào? Dựa trên dữ liệu giá và các sự kiện vĩ mô như quy hoạch KĐT mới, mở rộng QL3, chúng tôi đưa ra những phân tích về chu kỳ và các yếu tố cốt lõi đang thúc đẩy sự năng động của từng khu vực."
    },
    {
      link: '/ecosystem',
      imageUrl: 'https://picsum.photos/seed/blog4/600/400',
      category: 'Marketing & Tiếp Cận',
      title: "Hệ Sinh Thái MGA: Kênh Duy Nhất Là 'Chuyển Dịch Lợi Ích'",
      summary: "Facebook, Zalo, YouTube... không phải kênh marketing. Chúng là môi trường để chúng ta thực hành nghệ thuật duy nhất: điều phối cuộc chuyển dịch giá trị. Chúng ta không đăng tin, chúng ta chia sẻ phân tích. Chúng ta không tìm khách, chúng ta xây dựng niềm tin."
    },
    {
      link: '/case-study/de-xuat-ban-giao-dat',
      imageUrl: 'https://picsum.photos/seed/blog5/600/400',
      category: 'Case Study',
      title: 'Vụ Việc KDC Số 5: Hành Trình 15 Năm Đi Tìm Công Lý',
      summary: "Hồ sơ pháp lý, bằng chứng lịch sử và phân tích thiệt hại kinh tế từ sự chậm trễ bàn giao đất hơn 15 năm tại dự án KDC Số 5. Đây không chỉ là một vụ việc, mà là lời kêu gọi về trách nhiệm và sự minh bạch để bảo vệ quyền lợi hợp pháp của người dân."
    },
    {
      link: '/consultation',
      imageUrl: 'https://picsum.photos/seed/blog6/600/400',
      category: 'Công Cụ AI',
      title: "Góc Tư Vấn Chuyên Sâu Cùng 'Mèo AI'",
      summary: "Bạn có biết Mèo AI có thể giúp bạn phân tích sự hợp khắc về phong thủy hoặc đề xuất chiến lược đầu tư dựa trên ngân sách và mục tiêu? Khám phá ngay công cụ tư vấn chuyên sâu, biến dữ liệu thành quyết định sáng suốt."
    },
  ];
}
