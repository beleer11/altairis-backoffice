using AltairisBackoffice.Core.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AltairisBackoffice.Core.Interfaces
{
    public interface IRoomTypeRepository : IRepository<RoomType>
    {
        Task<IEnumerable<RoomType>> GetByHotelIdAsync(int hotelId);
    }
}