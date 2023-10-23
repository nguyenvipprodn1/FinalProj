using API.Data;
using Microsoft.EntityFrameworkCore;

namespace API.Services;

public class MarketingService
{
    private readonly SendMailBusinessService _sendMail;
    private readonly StoreContext _context;

    public MarketingService(SendMailBusinessService sendMail, StoreContext context)
    {
        _sendMail = sendMail;
        _context = context;
    }

    public async Task Run()
    {
        var now = DateTime.Now;
        var toDate = new DateTime(now.Year, now.Month, now.Day, now.Hour, now.Minute, 59, 999, DateTimeKind.Utc);

        var eventsToSend = await _context.AutomationMails
            .Where(appointment => appointment.Status == "Pending"
                                  && appointment.ScheduleOn <= toDate)
            .OrderBy(appointment => appointment.ScheduleOn)
            .ToListAsync();
        
        if (eventsToSend.Count == 0)
            return;
        
        foreach (var emailEvent in eventsToSend)
        {
            try
            {
                await _sendMail.SendEmailAsync(emailEvent.Gmail, emailEvent.Subject, emailEvent.Content);
                emailEvent.Status = "Sent";
            }
            catch (Exception e)
            {
                emailEvent.Status = "Fail";
                _context.SaveChanges();
            }
		        
        }

        _context.SaveChanges();
    }
}