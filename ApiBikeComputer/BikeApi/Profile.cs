public record BikeComputerDto(string Id, string Name, string FirmwareVersion, DateTimeOffset LastSyncedAt);

public record UserProfileDto(
    string Id,
    string DisplayName,
    string Email,
    string Location,
    DateOnly MemberSince,
    IReadOnlyList<BikeComputerDto> Devices);
