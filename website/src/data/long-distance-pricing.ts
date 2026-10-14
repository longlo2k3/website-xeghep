export interface DistanceRate {
  range: string;
  sedan5Seats: number;
  suv7Seats: number;
  van16Seats: number;
}

export const DISTANCE_RATES: DistanceRate[] = [
  { range: "Dưới 30 km (tối thiểu)", sedan5Seats: 11000, suv7Seats: 13000, van16Seats: 18000 },
  { range: "Từ 31 km - 100 km", sedan5Seats: 9500, suv7Seats: 11500, van16Seats: 16000 },
  { range: "Từ 101 km - 200 km", sedan5Seats: 8500, suv7Seats: 10500, van16Seats: 14500 },
  { range: "Trên 200 km", sedan5Seats: 8000, suv7Seats: 9500, van16Seats: 13500 },
];

export const LONG_DISTANCE_POLICIES = {
  roundTripDiscount: "Giảm 60% - 70% giá cước chiều về khi khách hàng đi khứ hồi trong ngày.",
  waitingTimeRule: "Miễn phí 1 giờ chờ đầu tiên. Các giờ chờ tiếp theo tính 60.000đ/giờ (tối đa 3 giờ chờ ban ngày).",
  tollsNote: "Giá cước tính theo km chưa bao gồm phí cầu đường, cao tốc và vé phà (nếu có). Quý khách thanh toán trực tiếp theo hóa đơn BOT.",
  overnightNote: "Khách có nhu cầu lưu đêm qua ngày vui lòng liên hệ tổng đài 0858.911.247 để nhận báo giá ưu đãi trọn gói gồm chi phí lưu đêm tài xế.",
};
