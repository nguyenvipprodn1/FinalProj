using API.Data;

namespace API.Services;

public class MarketingSenderService: BackgroundService
{
    private readonly ILogger<MarketingSenderService> _logger;
    private readonly IServiceProvider _services;

    public MarketingSenderService(
        ILogger<MarketingSenderService> logger,
        IServiceProvider services
    )
    {
        _logger = logger;
        _services = services;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using (var scope = _services.CreateScope())
                {
                    var marketingService = scope.ServiceProvider.GetRequiredService<MarketingService>();
                    await marketingService.Run();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while sending the email.");
            }

            // Here you could specify how often the email should be sent, for example every day, week, etc.
            await Task.Delay(TimeSpan.FromMinutes(3), stoppingToken);
        }
    }
}