# New dataclass
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class NotifyRequest:
    email: Optional[str]
    message: Optional[str]
