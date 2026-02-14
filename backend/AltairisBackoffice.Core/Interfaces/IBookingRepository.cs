using AltairisBackoffice.Core.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AltairisBackoffice.Core.Interfaces
{
    public interface IBookingRepository : IRepository<Booking>
    {
        Task<IEnumerable<Booking>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<Booking>> GetByRoomTypeIdAsync(int roomTypeId);
        Task<Booking?> GetByReferenceAsync(string reference);
        Task<IEnumerable<Booking>> GetByGuestEmailAsync(string email);
        Task<Dictionary<DateTime, int>> GetDailyOccupancyAsync(int hotelId, DateTime startDate, DateTime endDate);
        Task<decimal> GetRevenueByDateRangeAsync(DateTime startDate, DateTime endDate);
    }
}