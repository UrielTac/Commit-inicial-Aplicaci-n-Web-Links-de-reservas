import { PublishedForm } from "@/types/forms/publish";

class FormPublishService {
  private static STORAGE_KEY = 'published_forms';
  private static debug = {
    log: (message: string, data?: any) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[FormPublishService] ${message}`, data || '');
      }
    },
    error: (message: string, error?: any) => {
      if (process.env.NODE_ENV === 'development') {
        console.error(`[FormPublishService Error] ${message}`, error || '');
      }
    }
  };

  static async getStoredForms(): Promise<PublishedForm[]> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const forms = JSON.parse(stored);
      this.debug.log('Retrieved forms from storage:', forms);
      return forms;
    } catch (err) {
      this.debug.error('Error retrieving forms:', err);
      return [];
    }
  }

  static async publish(form: Omit<PublishedForm, 'id' | 'slug'>): Promise<string> {
    try {
      this.debug.log('Publishing form:', form);

      const id = crypto.randomUUID();
      const slug = await this.generateSlug(form.title);
      
      const publishedForm: PublishedForm = {
        ...form,
        id,
        slug,
        status: 'published',
        analytics: {
          views: 0,
          submissions: 0
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: new Date()
      };

      const forms = await this.getStoredForms();
      forms.push(publishedForm);
      
      await this.saveFormsToStorage(forms);
      this.debug.log('Form published successfully with slug:', slug);

      return slug;
    } catch (err) {
      this.debug.error('Error publishing form:', err);
      throw new Error('Error al publicar el formulario');
    }
  }

  static async getBySlug(slug: string): Promise<PublishedForm | null> {
    try {
      this.debug.log('Searching form with slug:', slug);
      
      const forms = await this.getStoredForms();
      const form = forms.find(f => f.slug === slug);
      
      if (form) {
        this.debug.log('Form found:', form);
        await this.incrementViews(form.id);
        return form;
      }
      
      this.debug.log('Form not found');
      return null;
    } catch (err) {
      this.debug.error('Error retrieving form by slug:', err);
      return null;
    }
  }

  static async incrementViews(formId: string): Promise<void> {
    const forms = await this.getStoredForms();
    const formIndex = forms.findIndex(f => f.id === formId);
    
    if (formIndex >= 0) {
      forms[formIndex].analytics.views += 1;
      forms[formIndex].analytics.lastView = new Date();
      await this.saveFormsToStorage(forms);
    }
  }

  private static async generateSlug(title: string): Promise<string> {
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    const forms = await this.getStoredForms();
    const existingSlugs = forms.map(f => f.slug);
    
    let slug = baseSlug;
    let counter = 1;
    
    while (existingSlugs.includes(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    return slug;
  }

  private static async saveFormsToStorage(forms: PublishedForm[]): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(forms));
      this.debug.log('Forms saved to storage successfully');
    } catch (err) {
      this.debug.error('Error saving forms to storage:', err);
      throw new Error('Error al guardar los formularios');
    }
  }
}

export default FormPublishService; 