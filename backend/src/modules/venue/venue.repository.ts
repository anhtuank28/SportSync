import { prisma } from '../../config/database';

export class VenueRepository {
  async findBySlug(slug: string) {
    return prisma.venue.findUnique({
      where: { slug },
      include: {
        district: true,
        courts: {
          where: { isActive: true },
          orderBy: { courtNumber: 'asc' },
        },
        pricingRules: true,
      },
    });
  }

  async findBookingSlots(courtIds: string[], date: string) {
    return prisma.bookingSlot.findMany({
      where: {
        courtId: { in: courtIds },
        date,
      },
      include: {
        booking: {
          select: {
            customerName: true,
            customerPhone: true,
            paymentMethod: true,
            holdExpiresAt: true,
            status: true,
          },
        },
      },
    });
  }

  async findAllVenuesWithLocation() {
    return prisma.venue.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        address: true,
        latitude: true,
        longitude: true,
        rating: true,
        ratingCount: true,
        courts: {
          where: { isActive: true },
          select: { id: true },
        },
        pricingRules: {
          select: { pricePerHour: true },
        },
      },
    });
  }

  async findAllDistrictsWithVenues() {
    return prisma.district.findMany({
      orderBy: { name: 'asc' },
      include: {
        venues: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            slug: true,
            address: true,
            rating: true,
            isBwfStandard: true,
          },
        },
      },
    });
  }
}

export const venueRepository = new VenueRepository();
