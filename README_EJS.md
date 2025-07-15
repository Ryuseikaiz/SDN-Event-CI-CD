# Event Management System - FPT University Da Nang

Hệ thống quản lý sự kiện cho phép Admin quản lý và Sinh viên đăng ký các sự kiện. Hệ thống sử dụng Node.js, Express, MongoDB và EJS, hỗ trợ xác thực, phân quyền và thông báo real-time.

## Tính năng

-   Xác thực người dùng (JWT qua Cookies).
-   Phân quyền truy cập dựa trên vai trò (admin/student).
-   Giao diện responsive sử dụng Bootstrap 5.
-   **Sinh viên**: Xem, đăng ký và hủy đăng ký sự kiện.
-   **Admin**: Xem danh sách đăng ký (có phân trang) và tìm kiếm theo ngày.
-   Thông báo real-time cho admin khi có đăng ký mới (sử dụng Socket.IO).

## Bắt đầu

### Yêu cầu

-   Node.js (v14 trở lên)
-   MongoDB

### 1. Cài đặt

Clone repository (nếu có) hoặc sao chép các tệp vào thư mục dự án của bạn và cài đặt dependencies:

```bash
npm install