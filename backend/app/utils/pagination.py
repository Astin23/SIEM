from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
import math

async def paginate(session: AsyncSession, query, page: int, page_size: int):
    """
    Paginate a SQLAlchemy query.
    Returns: items, total_count, total_pages
    """
    if page < 1:
        page = 1
    if page_size < 1:
        page_size = 50
    if page_size > 1000:
        page_size = 1000
        
    offset = (page - 1) * page_size
    
    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total = await session.scalar(count_query)
    
    # Fetch items
    items_query = query.offset(offset).limit(page_size)
    result = await session.execute(items_query)
    items = result.scalars().all()
    
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    
    return items, total, total_pages
