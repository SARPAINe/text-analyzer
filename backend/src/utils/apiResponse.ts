// utils/apiResponse.ts

export class ApiResponse<T = any> {
  public success: boolean;
  public message: string;
  public data: T | null;

  constructor(message: string, data: T | null = null, success: boolean = true) {
    this.success = success;
    this.message = message;
    this.data = data;
  }
}
