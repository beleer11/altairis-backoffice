using AltairisBackoffice.Core.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AltairisBackoffice.Core.Interfaces
{
    public interface IHotelRepository : IRepository<Hotel>
    {
        Task<IEnumerable<Hotel>> SearchAsync(string? name, string? city, string? country, int? minRating);
        Task<Hotel?> GetHotelWithRoomTypesAsync(int id);
        Task<IEnumerable<Hotel>> GetPagedWithRoomTypesAsync(int page, int pageSize);
    }
}