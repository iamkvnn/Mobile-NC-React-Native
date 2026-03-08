import { apiService } from './api.service';
import { EnrollmentCheckResponse } from '@/types/cart.types';

class EnrollmentService {
  async checkEnrollment(courseIds: string[]): Promise<EnrollmentCheckResponse> {
    return apiService.post<EnrollmentCheckResponse>('/enrollments/check', courseIds);
  }
}

export const enrollmentService = new EnrollmentService();
export default enrollmentService;
