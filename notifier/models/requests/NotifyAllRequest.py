# New dataclass
from dataclasses import dataclass, field


@dataclass
class NotifyAllRequest:
    message: str
    emails: list[str] = field(default_factory=list)
    # telegramIds: list[int] = field(default_factory=list)
