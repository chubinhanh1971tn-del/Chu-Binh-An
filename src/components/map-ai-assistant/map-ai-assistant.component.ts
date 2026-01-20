import { ChangeDetectionStrategy, Component, output, inject, signal, ElementRef, viewChild, afterNextRender, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../services/gemini.service';
import { FilterCriteria } from '../../models/property.model';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  isThinking?: boolean;
}

@Component({
  selector: 'app-map-ai-assistant',
  standalone: true,
  templateUrl: './map-ai-assistant.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
})
export class MapAIAssistantComponent {
  private geminiService = inject(GeminiService);
  
  filtersApplied = output<Partial<FilterCriteria> & { location?: string }>();
  suggestionClicked = output<string>();
  areaContext = input<string>('');
  
  chatContainer = viewChild<ElementRef>('chatContainer');

  isOpen = signal(false);
  userInput = signal('');
  messages = signal<ChatMessage[]>([
    { sender: 'ai', text: 'Chào bạn, Mèo đây! Bạn muốn tìm ngôi nhà mơ ước như thế nào? Hãy mô tả ngắn gọn nhé!' }
  ]);
  
  constructor() {
    afterNextRender(() => {
        this.scrollToBottom();
    });
  }

  // FIX: Added the handleNoResults method to allow parent components to trigger a "no results" message in the chat.
  public handleNoResults(): void {
    const noResultsMessage: ChatMessage = {
      sender: 'ai',
      text: 'Rất tiếc, Mèo không tìm thấy bất động sản nào phù hợp với yêu cầu của bạn. Bạn có muốn thử một tìm kiếm khác không?'
    };
    this.messages.update(m => [...m, noResultsMessage]);
    this.scrollToBottom();
  }

  toggleChat() {
    this.isOpen.update(v => !v);
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const container = this.chatContainer()?.nativeElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 0);
  }

  async sendMessage() {
    const query = this.userInput().trim();
    if (!query) return;

    // Add user message and AI thinking bubble
    this.messages.update(m => [...m, { sender: 'user', text: query }]);
    this.userInput.set('');
    this.scrollToBottom();
    
    this.messages.update(m => [...m, { sender: 'ai', text: '', isThinking: true }]);
    this.scrollToBottom();

    try {
      const result = await this.geminiService.findPropertiesFromQuery(query);
      
      // Update AI thinking bubble with the actual response
      this.messages.update(m => {
        const lastMessage = m[m.length - 1];
        if (lastMessage && lastMessage.isThinking) {
          lastMessage.text = result.responseMessage;
          lastMessage.isThinking = false;
        }
        return [...m];
      });
      this.scrollToBottom();
      
      // Emit the filters to the parent component
      const { responseMessage, ...filters } = result;
      this.filtersApplied.emit(filters);

    } catch (error: any) {
        this.messages.update(m => {
            const lastMessage = m[m.length - 1];
            if (lastMessage && lastMessage.isThinking) {
                lastMessage.text = error.message || 'Mèo gặp chút lỗi rồi, bạn thử lại sau nhé!';
                lastMessage.isThinking = false;
            }
            return [...m];
        });
        this.scrollToBottom();
    }
  }

  useSuggestion(suggestion: string) {
    this.userInput.set(suggestion);
    this.sendMessage();
  }
}
