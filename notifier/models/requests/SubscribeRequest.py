from dataclasses import dataclass
from typing import Optional


@dataclass
class SubscribeRequest:
    email: Optional[str]
