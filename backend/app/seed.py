"""
Seed script — populates the database with realistic data for performance testing.

Usage (from docker compose):
    docker compose exec backend python -m app.seed

Volumes:
    ~200 clients, ~50 technicians, ~1 000 work orders with full status-history chains.
"""

import asyncio
import random
import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy import func, select

from app.core.database import async_session_maker
from app.clients.models import Client
from app.technicians.models import Technician
from app.work_orders.enums import WorkOrderPriority, WorkOrderStatus
from app.work_orders.models import WorkOrder, WorkOrderStatusHistory

# ---------------------------------------------------------------------------
# Data pools
# ---------------------------------------------------------------------------

FIRST_NAMES = [
    "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
    "William", "Barbara", "David", "Elizabeth", "Richard", "Susan", "Joseph", "Jessica",
    "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Lisa", "Daniel", "Nancy",
    "Matthew", "Betty", "Anthony", "Sandra", "Mark", "Dorothy", "Donald", "Ashley",
    "Steven", "Emily", "Paul", "Kimberly", "Andrew", "Donna", "Joshua", "Michelle",
    "Kenneth", "Carol", "Kevin", "Amanda", "Brian", "Melissa", "George", "Deborah",
    "Timothy", "Stephanie",
]

LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
    "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
    "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
    "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker",
    "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
    "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
    "Carter", "Roberts",
]

COMPANY_SUFFIXES = ["LLC", "Inc.", "Corp.", "Solutions", "Services", "Group", "Co."]
COMPANY_ADJECTIVES = [
    "Apex", "Summit", "Vertex", "Pioneer", "Keystone", "Horizon", "Meridian", "Pinnacle",
    "Cascade", "Pacific", "Atlantic", "Central", "Eastern", "Western", "Coastal",
    "Highland", "Lakeside", "Riverside", "Metro", "Premier", "Elite", "Sterling",
    "Prestige", "Vanguard", "Heritage", "Landmark", "National", "Allied", "United",
]
COMPANY_INDUSTRIES = [
    "Construction", "Plumbing", "Electric", "HVAC", "Roofing", "Maintenance",
    "Facility", "Property", "Industrial", "Commercial", "Residential",
]

EMAIL_DOMAINS = [
    "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com",
    "protonmail.com", "company.com", "business.net", "enterprise.io",
]

STREET_TYPES = ["St", "Ave", "Blvd", "Dr", "Ln", "Rd", "Way", "Ct", "Pl"]
CITIES = [
    "Austin", "Denver", "Portland", "Nashville", "Charlotte", "Indianapolis",
    "Columbus", "San Antonio", "Jacksonville", "Memphis", "Boston", "Seattle",
    "Las Vegas", "Louisville", "Baltimore", "Milwaukee", "Albuquerque", "Tucson",
    "Fresno", "Sacramento", "Mesa", "Kansas City", "Atlanta", "Omaha", "Raleigh",
]
STATES = ["TX", "CO", "OR", "TN", "NC", "IN", "OH", "FL", "CA", "NV", "KY", "MD"]

SPECIALTIES = [
    "HVAC", "Electrical", "Plumbing", "Carpentry", "Painting", "Roofing",
    "Flooring", "Landscaping", "Welding", "General Maintenance", "Fire Safety",
    "Security Systems", "Solar Installation", "Elevator Maintenance",
]

WO_TITLE_VERBS = [
    "Install", "Repair", "Replace", "Inspect", "Service", "Upgrade",
    "Maintain", "Configure", "Calibrate", "Clean", "Test", "Overhaul",
]
WO_TITLE_SUBJECTS = [
    "HVAC unit", "electrical panel", "plumbing fixtures", "roof sections",
    "security system", "fire suppression system", "elevator components",
    "boiler", "water heater", "generator", "solar panels", "lighting system",
    "air handling unit", "condensate drain", "exhaust fan", "gas line",
    "sprinkler heads", "parking lot lights", "emergency exit signs",
    "cooling tower", "chiller unit", "heat pump", "circuit breakers",
    "door hardware", "window seals",
]

WO_DESCRIPTIONS = [
    "Customer reported {issue}. Technician to assess on-site and provide resolution.",
    "Scheduled preventive maintenance. Check all components and replace consumables.",
    "Urgent call — {issue} reported. Priority dispatch required.",
    "Annual inspection as per service contract. Document findings and flag any issues.",
    "Follow-up visit from previous work order. Verify fix is holding.",
    "New installation per approved quote #{quote}. Coordinate with site manager.",
    "Warranty repair — unit is under manufacturer warranty until next quarter.",
    "Tenant reported {issue}. Building manager approved remediation.",
]

ISSUES = [
    "intermittent failure", "complete shutdown", "unusual noise", "water leak",
    "overheating", "power fluctuation", "reduced efficiency", "error code displayed",
    "burning smell", "vibration", "electrical fault",
]

STATUS_NOTES = [
    "Parts ordered and confirmed available.",
    "Client notified of technician arrival window.",
    "Issue diagnosed — awaiting part delivery.",
    "Work completed and tested. Client signed off.",
    "Follow-up inspection scheduled for next week.",
    "Client requested rescheduling.",
    "Escalated to senior technician.",
    "Cancelled per client request — project postponed.",
    "Resolved after replacing faulty component.",
    None,
    None,
    None,  # some entries have no notes
]


# ---------------------------------------------------------------------------
# Generators
# ---------------------------------------------------------------------------

def _rnd_name() -> str:
    return f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"


def _rnd_company() -> str:
    return (
        f"{random.choice(COMPANY_ADJECTIVES)} "
        f"{random.choice(COMPANY_INDUSTRIES)} "
        f"{random.choice(COMPANY_SUFFIXES)}"
    )


def _rnd_email(name: str) -> str:
    slug = name.lower().replace(" ", random.choice([".", "_", ""]))
    return f"{slug}{random.randint(1, 99)}@{random.choice(EMAIL_DOMAINS)}"


def _rnd_phone() -> str:
    area = random.randint(200, 999)
    mid = random.randint(200, 999)
    end = random.randint(1000, 9999)
    return f"({area}) {mid}-{end}"


def _rnd_address() -> str:
    number = random.randint(100, 9999)
    street = f"{random.choice(LAST_NAMES)} {random.choice(STREET_TYPES)}"
    city = random.choice(CITIES)
    state = random.choice(STATES)
    zipcode = random.randint(10000, 99999)
    return f"{number} {street}, {city}, {state} {zipcode}"


def _rnd_dt(days_ago_min: int, days_ago_max: int) -> datetime:
    delta = random.randint(days_ago_min, days_ago_max)
    base = datetime.now(UTC) - timedelta(days=delta)
    # randomise time-of-day
    base = base.replace(
        hour=random.randint(6, 20),
        minute=random.choice([0, 15, 30, 45]),
        second=0,
        microsecond=0,
    )
    return base


def _rnd_wo_title() -> str:
    return f"{random.choice(WO_TITLE_VERBS)} {random.choice(WO_TITLE_SUBJECTS)}"


def _rnd_wo_description() -> str | None:
    if random.random() < 0.15:
        return None
    tmpl = random.choice(WO_DESCRIPTIONS)
    return tmpl.format(
        issue=random.choice(ISSUES),
        quote=random.randint(1000, 9999),
    )


def _rnd_status_note() -> str | None:
    return random.choice(STATUS_NOTES)


def _build_history(
    work_order_id: uuid.UUID,
    final_status: WorkOrderStatus,
    base_dt: datetime,
) -> list[WorkOrderStatusHistory]:
    """Build the full transition chain that leads to `final_status`."""
    chains: dict[WorkOrderStatus, list[tuple[WorkOrderStatus | None, WorkOrderStatus]]] = {
        WorkOrderStatus.PENDING: [
            (None, WorkOrderStatus.PENDING),
        ],
        WorkOrderStatus.ASSIGNED: [
            (None, WorkOrderStatus.PENDING),
            (WorkOrderStatus.PENDING, WorkOrderStatus.ASSIGNED),
        ],
        WorkOrderStatus.IN_PROGRESS: [
            (None, WorkOrderStatus.PENDING),
            (WorkOrderStatus.PENDING, WorkOrderStatus.ASSIGNED),
            (WorkOrderStatus.ASSIGNED, WorkOrderStatus.IN_PROGRESS),
        ],
        WorkOrderStatus.COMPLETED: [
            (None, WorkOrderStatus.PENDING),
            (WorkOrderStatus.PENDING, WorkOrderStatus.ASSIGNED),
            (WorkOrderStatus.ASSIGNED, WorkOrderStatus.IN_PROGRESS),
            (WorkOrderStatus.IN_PROGRESS, WorkOrderStatus.COMPLETED),
        ],
        WorkOrderStatus.CANCELLED: [
            (None, WorkOrderStatus.PENDING),
            (WorkOrderStatus.PENDING, WorkOrderStatus.CANCELLED),
        ],
    }

    transitions = chains[final_status]
    records = []
    step_hours = random.randint(4, 48)

    for i, (from_s, to_s) in enumerate(transitions):
        ts = base_dt + timedelta(hours=i * step_hours + random.randint(0, 3))
        records.append(
            WorkOrderStatusHistory(
                id=uuid.uuid4(),
                work_order_id=work_order_id,
                from_status=from_s.value if from_s else None,
                to_status=to_s.value,
                notes=_rnd_status_note(),
                created_at=ts,
            )
        )

    return records


# ---------------------------------------------------------------------------
# Main seeder
# ---------------------------------------------------------------------------

NUM_CLIENTS = 200
NUM_TECHNICIANS = 50
NUM_WORK_ORDERS = 1_000

# Rough distribution of final statuses
STATUS_WEIGHTS = [
    (WorkOrderStatus.PENDING, 0.20),
    (WorkOrderStatus.ASSIGNED, 0.15),
    (WorkOrderStatus.IN_PROGRESS, 0.20),
    (WorkOrderStatus.COMPLETED, 0.35),
    (WorkOrderStatus.CANCELLED, 0.10),
]

PRIORITY_WEIGHTS = [
    (WorkOrderPriority.LOW, 0.15),
    (WorkOrderPriority.MEDIUM, 0.45),
    (WorkOrderPriority.HIGH, 0.30),
    (WorkOrderPriority.URGENT, 0.10),
]


def _weighted_choice(options: list[tuple]) -> any:
    items, weights = zip(*options)
    return random.choices(items, weights=weights, k=1)[0]


async def _already_seeded(session) -> bool:
    result = await session.execute(select(func.count()).select_from(Client))
    count = result.scalar()
    return count >= NUM_CLIENTS


async def seed() -> None:
    async with async_session_maker() as session:
        if await _already_seeded(session):
            print("Database already seeded — skipping.")
            return

        print(f"Seeding {NUM_CLIENTS} clients...")
        clients: list[Client] = []
        for _ in range(NUM_CLIENTS):
            use_company = random.random() < 0.6
            name = _rnd_company() if use_company else _rnd_name()
            client = Client(
                id=uuid.uuid4(),
                name=name,
                email=_rnd_email(name.split()[0].lower() + "_" + name.split()[-1].lower()),
                phone=_rnd_phone() if random.random() < 0.85 else None,
                address=_rnd_address() if random.random() < 0.75 else None,
            )
            clients.append(client)
        session.add_all(clients)

        print(f"Seeding {NUM_TECHNICIANS} technicians...")
        technicians: list[Technician] = []
        for _ in range(NUM_TECHNICIANS):
            name = _rnd_name()
            tech = Technician(
                id=uuid.uuid4(),
                name=name,
                email=_rnd_email(name),
                phone=_rnd_phone() if random.random() < 0.90 else None,
                specialty=random.choice(SPECIALTIES),
                is_active=random.random() < 0.85,
            )
            technicians.append(tech)
        session.add_all(technicians)

        # flush so FKs resolve
        await session.flush()

        active_technicians = [t for t in technicians if t.is_active]

        print(f"Seeding {NUM_WORK_ORDERS} work orders + status history...")
        work_orders: list[WorkOrder] = []
        history_records: list[WorkOrderStatusHistory] = []

        for _ in range(NUM_WORK_ORDERS):
            final_status: WorkOrderStatus = _weighted_choice(STATUS_WEIGHTS)
            priority: WorkOrderPriority = _weighted_choice(PRIORITY_WEIGHTS)

            client = random.choice(clients)
            # unassigned orders more likely when pending
            assign_tech = final_status != WorkOrderStatus.PENDING or random.random() < 0.3
            technician = random.choice(active_technicians) if assign_tech and active_technicians else None

            # scheduled_at: spread across past 2 years + up to 90 days future
            if final_status in (WorkOrderStatus.COMPLETED, WorkOrderStatus.CANCELLED):
                scheduled_at = _rnd_dt(days_ago_min=30, days_ago_max=730)
            elif final_status in (WorkOrderStatus.ASSIGNED, WorkOrderStatus.IN_PROGRESS):
                scheduled_at = _rnd_dt(days_ago_min=0, days_ago_max=30)
            else:
                # pending — mix of past and future
                if random.random() < 0.5:
                    scheduled_at = _rnd_dt(days_ago_min=0, days_ago_max=14)
                else:
                    scheduled_at = datetime.now(UTC) + timedelta(days=random.randint(1, 90))
                    scheduled_at = scheduled_at.replace(
                        hour=random.randint(6, 20), minute=random.choice([0, 15, 30, 45]),
                        second=0, microsecond=0,
                    )

            completed_at = None
            if final_status == WorkOrderStatus.COMPLETED:
                completed_at = scheduled_at + timedelta(hours=random.randint(1, 8))

            wo_id = uuid.uuid4()
            wo = WorkOrder(
                id=wo_id,
                title=_rnd_wo_title(),
                description=_rnd_wo_description(),
                status=final_status.value,
                priority=priority.value,
                client_id=client.id,
                technician_id=technician.id if technician else None,
                scheduled_at=scheduled_at,
                completed_at=completed_at,
            )
            work_orders.append(wo)
            history_records.extend(_build_history(wo_id, final_status, scheduled_at))

        session.add_all(work_orders)
        await session.flush()
        session.add_all(history_records)

        await session.commit()

    total_history = len(history_records)
    print(
        f"Done. Inserted: {NUM_CLIENTS} clients, {NUM_TECHNICIANS} technicians, "
        f"{NUM_WORK_ORDERS} work orders, {total_history} status-history records."
    )


if __name__ == "__main__":
    asyncio.run(seed())
