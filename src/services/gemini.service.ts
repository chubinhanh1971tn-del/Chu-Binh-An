import { Injectable, signal, computed } from '@angular/core';
import { GoogleGenAI, Type } from '@google/genai';
import { Property, FilterCriteria } from '../models/property.model';

@Injectable({ providedIn: 'root' })
export class GeminiService {
  private ai = signal<GoogleGenAI | null>(null);

  isAiConfigured = computed(() => this.ai() !== null);

  constructor() {
    // AI Studio provides process.env.API_KEY.
    const apiKey = process.env.API_KEY;
    if (apiKey) {
      try {
        this.ai.set(new GoogleGenAI({ apiKey }));
      } catch (error) {
        console.error("Error initializing GoogleGenAI:", error);
        this.ai.set(null);
      }
    } else {
      console.warn("API_KEY environment variable not set. AI features will be disabled.");
      this.ai.set(null);
    }
  }

  private createPrompt(property: Property): string {
    let prompt = `Bạn là Mèo AI, trợ lý bất động sản thông minh của Appmap365, một chuyên gia viết quảng cáo bất động sản hàng đầu tại Việt Nam. Hãy viết một mô tả hấp dẫn, chuyên nghiệp và đầy đủ cho một bất động sản tại Thái Nguyên với các thông tin sau:\n`;
    prompt += `- Tiêu đề: ${property.title}\n`;
    prompt += `- Địa chỉ: ${property.address}\n`;
    prompt += `- Loại hình: ${property.type}\n`;
    prompt += `- Mục đích: ${property.listingType}\n`;
    prompt += `- Giá: ${property.listingType === 'Bán' ? new Intl.NumberFormat('vi-VN').format(property.price) + ' VNĐ' : new Intl.NumberFormat('vi-VN').format(property.rentPrice || 0) + ' VNĐ/tháng'}\n`;
    prompt += `- Diện tích: ${property.area} m²\n`;
    if (property.type !== 'Đất') {
      prompt += `- Số phòng ngủ: ${property.bedrooms}\n`;
      prompt += `- Số phòng tắm: ${property.bathrooms}\n`;
    }
    if (property.transactionDetails.yearBuilt) {
      prompt += `- Năm xây dựng: ${property.transactionDetails.yearBuilt}\n`;
    }
    prompt += `- Pháp lý: ${property.transactionDetails.legalStatus}\n\n`;
    prompt += `Hãy viết một đoạn văn mô tả liền mạch (không dùng gạch đầu dòng), tập trung vào các điểm mạnh như vị trí, tiện ích, tiềm năng đầu tư, và không gian sống. Sử dụng ngôn ngữ lôi cuốn, chuyên nghiệp, phù hợp với người mua/thuê nhà tại Việt Nam. Kết thúc bằng một lời kêu gọi hành động mạnh mẽ.`;
    return prompt;
  }

  private createAgentAnalysisPrompt(property: Property): string {
    let prompt = `Bạn là Mèo AI, trợ lý bất động sản thông minh của Appmap365, một chuyên gia phân tích bất động sản kỳ cựu. Hãy thực hiện một phân tích chuyên sâu cho bất động sản sau đây để tư vấn cho một môi giới khác. Cung cấp câu trả lời dưới dạng JSON.\n\n`;
    prompt += `Thông tin BĐS:\n`;
    prompt += `- Tiêu đề: ${property.title}\n`;
    prompt += `- Địa chỉ: ${property.address}\n`;
    prompt += `- Loại hình: ${property.type}\n`;
    prompt += `- Mục đích: ${property.listingType}\n`;
    prompt += `- Giá: ${property.listingType === 'Bán' ? new Intl.NumberFormat('vi-VN').format(property.price) + ' VNĐ' : new Intl.NumberFormat('vi-VN').format(property.rentPrice || 0) + ' VNĐ/tháng'}\n`;
    prompt += `- Diện tích: ${property.area} m²\n`;
    if (property.type !== 'Đất') {
      prompt += `- Số phòng ngủ: ${property.bedrooms}\n`;
      prompt += `- Số phòng tắm: ${property.bathrooms}\n`;
    }
    prompt += `- Pháp lý: ${property.transactionDetails.legalStatus}\n\n`;
    prompt += `Yêu cầu phân tích:\n`;
    prompt += `1. Điểm mạnh (strengths): Nêu 3-4 điểm mạnh cốt lõi (vị trí, giá, pháp lý, tiềm năng tăng giá...).\n`;
    prompt += `2. Điểm yếu (weaknesses): Nêu 1-2 điểm yếu hoặc rủi ro tiềm ẩn (ngõ hẹp, quy hoạch treo gần đó, giá cao hơn thị trường...).\n`;
    prompt += `3. Tiềm năng (potential): Phân tích tiềm năng phát triển trong tương lai (ăn theo dự án lớn nào, hạ tầng sắp mở rộng...).\n`;
    prompt += `4. Đối tượng phù hợp (suitableFor): Gợi ý đối tượng khách hàng phù hợp nhất (gia đình trẻ, nhà đầu tư lướt sóng, cho thuê dòng tiền...).\n\n`;
    prompt += `Hãy trả về kết quả chỉ dưới dạng một object JSON với các key: "strengths", "weaknesses", "potential", "suitableFor".`;
    return prompt;
  }

  async generateDescription(property: Property): Promise<string> {
    if (!this.ai()) {
      return 'Mô tả chi tiết đang được cập nhật...';
    }
    const prompt = this.createPrompt(property);
    try {
      const response = await this.ai()!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text.trim();
    } catch (error) {
      console.error('Error generating description:', error);
      return 'Không thể tạo mô tả tự động. Vui lòng thử lại.';
    }
  }

  async generateAgentAnalysis(property: Property): Promise<{ strengths: string; weaknesses: string; potential: string; suitableFor: string; } | null> {
    if (!this.ai()) return null;
    const prompt = this.createAgentAnalysisPrompt(property);
    try {
      const response = await this.ai()!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });
      const jsonStr = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Error generating agent analysis:', error);
      return null;
    }
  }

  async generateFengShuiAnalysis(birthYear: number, direction: string): Promise<any> {
    if (!this.ai()) return { error: 'AI is not configured' };
    const prompt = `Bạn là chuyên gia phong thủy. Phân tích sự hợp và khắc của một người sinh năm ${birthYear} với một ngôi nhà hướng ${direction} tại Việt Nam. Cung cấp câu trả lời dưới dạng JSON với các key: "mệnh" (ngũ hành), "hướngTốt", "hướngXấu", "màuSắcHợp", "lờiKhuyên" (đưa ra một lời khuyên ngắn gọn về cách hóa giải hoặc tận dụng).`;
    try {
      const response = await this.ai()!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text.trim());
    } catch (error) {
      console.error('Error generating feng shui analysis:', error);
      return { error: 'Failed to generate analysis.' };
    }
  }

  async generateInvestmentAdvice(budget: number, goal: string, risk: string): Promise<any> {
    if (!this.ai()) return { error: 'AI is not configured' };
    const prompt = `Bạn là chuyên gia tư vấn đầu tư BĐS tại Thái Nguyên, Việt Nam. Với ngân sách ${new Intl.NumberFormat('vi-VN').format(budget)} VNĐ, mục tiêu "${goal}", và mức độ chấp nhận rủi ro "${risk}", hãy đưa ra một chiến lược đầu tư. Cung cấp câu trả lời dưới dạng JSON với các key: "loạiHìnhPhùHợp" (ví dụ: đất nền, chung cư, nhà phố), "khuVựcTiềmNăng" (gợi ý 2-3 khu vực cụ thể tại Thái Nguyên), "chiếnLược" (mô tả ngắn gọn chiến lược, ví dụ: mua và chờ tăng giá, mua để cho thuê...), và "lưuÝ" (một cảnh báo hoặc lưu ý quan trọng).`;
    try {
      const response = await this.ai()!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text.trim());
    } catch (error) {
      console.error('Error generating investment advice:', error);
      return { error: 'Failed to generate advice.' };
    }
  }
  
  async findPropertiesFromQuery(query: string): Promise<Partial<FilterCriteria> & { location?: string; responseMessage: string }> {
    if (!this.ai()) throw new Error('AI service not available.');
    const prompt = `Bạn là Mèo AI, trợ lý tìm kiếm BĐS thông minh. Dựa vào yêu cầu của người dùng, hãy trích xuất các tiêu chí tìm kiếm và trả về một object JSON.
Yêu cầu người dùng: "${query}"

Các tiêu chí có thể trích xuất:
- "location": Địa điểm cụ thể (VD: "Phan Đình Phùng", "Đại Từ", "trung tâm thành phố").
- "type": Loại hình ("Nhà", "Đất", "Căn hộ").
- "listingType": Mục đích ("Bán", "Cho Thuê").
- "minPrice": Giá tối thiểu (dưới dạng số, đơn vị VNĐ).
- "maxPrice": Giá tối đa (dưới dạng số, đơn vị VNĐ).
- "minRentPrice": Giá tối thiểu cho thuê (dưới dạng số, đơn vị VNĐ).
- "maxRentPrice": Giá tối đa cho thuê (dưới dạng số, đơn vị VNĐ).
- "minArea": Diện tích tối thiểu (dưới dạng số, đơn vị m2).
- "maxArea": Diện tích tối đa (dưới dạng số, đơn vị m2).
- "bedrooms": Số phòng ngủ (dưới dạng số).
- "responseMessage": Một câu trả lời thân thiện cho người dùng, xác nhận đã hiểu yêu cầu. Ví dụ: "Ok Mèo hiểu rồi, Mèo sẽ tìm nhà bán ở trung tâm, giá khoảng 2 tỷ cho bạn nhé!".

Ví dụ:
- Input: "tìm nhà bán ở trung tâm giá khoảng 2 tỷ" -> Output: {"location": "trung tâm thành phố", "listingType": "Bán", "type": "Nhà", "maxPrice": 2000000000, "responseMessage": "Ok Mèo hiểu rồi, Mèo sẽ tìm nhà bán ở trung tâm, giá khoảng 2 tỷ cho bạn nhé!"}
- Input: "căn hộ cho thuê 2 phòng ngủ dưới 5 triệu" -> Output: {"type": "Căn hộ", "listingType": "Cho Thuê", "bedrooms": 2, "maxRentPrice": 5000000, "responseMessage": "Đã rõ, Mèo đang tìm căn hộ 2 phòng ngủ cho thuê giá dưới 5 triệu đây!"}

Hãy chỉ trả về object JSON, không có giải thích hay định dạng markdown. Nếu không trích xuất được thông tin nào, hãy bỏ qua key đó. Luôn luôn có "responseMessage".
    `;
    
    try {
      const response = await this.ai()!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              location: { type: Type.STRING, nullable: true },
              type: { type: Type.STRING, nullable: true },
              listingType: { type: Type.STRING, nullable: true },
              minPrice: { type: Type.NUMBER, nullable: true },
              maxPrice: { type: Type.NUMBER, nullable: true },
              minRentPrice: { type: Type.NUMBER, nullable: true },
              maxRentPrice: { type: Type.NUMBER, nullable: true },
              minArea: { type: Type.NUMBER, nullable: true },
              maxArea: { type: Type.NUMBER, nullable: true },
              bedrooms: { type: Type.INTEGER, nullable: true },
              responseMessage: { type: Type.STRING },
            },
            required: ["responseMessage"]
          }
        }
      });
      const jsonStr = response.text.trim();
      const parsed = JSON.parse(jsonStr) as any;
      
      const filters: Partial<FilterCriteria> & { location?: string; responseMessage: string } = {
          responseMessage: parsed.responseMessage || "Mèo đã nhận được yêu cầu của bạn!"
      };
      if(parsed.type) filters.type = parsed.type;
      if(parsed.listingType) filters.listingType = parsed.listingType;
      if(parsed.minPrice) filters.minPrice = String(parsed.minPrice);
      if(parsed.maxPrice) filters.maxPrice = String(parsed.maxPrice);
      if(parsed.minRentPrice) filters.minRentPrice = String(parsed.minRentPrice);
      if(parsed.maxRentPrice) filters.maxRentPrice = String(parsed.maxRentPrice);
      if(parsed.minArea) filters.minArea = parsed.minArea;
      if(parsed.maxArea) filters.maxArea = parsed.maxArea;
      if(parsed.bedrooms) filters.bedrooms = parsed.bedrooms;
      if(parsed.location) filters.location = parsed.location;

      return filters;
    } catch (error) {
        console.error("Error finding properties from query:", error);
        throw new Error("Mèo không hiểu yêu cầu của bạn. Bạn có thể diễn đạt khác được không?");
    }
  }
}
