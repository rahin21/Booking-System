# Resort Booking System

A comprehensive online reservation and booking system built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui components. This system allows administrators to manage various reservation services such as resorts, hotels, vehicles, and conference halls, while customers can easily search, filter, and book accommodations.

## Features

### 🏨 **Multi-Service Support**
- **Resorts & Hotels**: Luxury accommodations with detailed amenities
- **Villas & Cabins**: Unique lodging experiences
- **Conference Halls**: Professional meeting spaces
- **Vehicles**: Transportation services
- **Custom Services**: Extensible service types

### 🔍 **Advanced Search & Filtering**
- Real-time search across service names and descriptions
- Filter by service type, location, and price range
- Dynamic price filtering (Under $100, $100-$200, etc.)
- Location-based filtering with visual icons

### 📅 **Booking Management**
- **Check-in/Check-out**: Date selection with validation
- **Customer Details**: Comprehensive customer information collection
- **Guest Count**: Flexible guest number selection
- **Special Requests**: Custom requirements field
- **Payment Methods**: Multiple payment options

### 👨‍💼 **Admin Dashboard**
- **Service Management**: Add, edit, and delete services
- **Reservation Tracking**: Monitor all bookings and their status
- **Customer Database**: Manage customer information
- **Payment Status**: Track payment completion
- **Analytics**: Revenue and booking statistics

### 💳 **Payment Integration**
- Multiple payment method support
- Dynamic pricing calculation
- Payment status tracking
- Secure transaction handling

### 🎨 **Modern UI/UX**
- Responsive design for all devices
- Beautiful gradient backgrounds
- Interactive cards and modals
- Smooth animations and transitions
- Professional color scheme

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **Icons**: Lucide React
- **Database**: Supabase (configured for future use)
- **Deployment**: Vercel ready

## Database Schema

The system is designed around these core tables:

```sql
-- Admin table for service management
CREATE TABLE Admin (
    a_id SERIAL PRIMARY KEY,
    a_name VARCHAR(255),
    a_email VARCHAR(255) UNIQUE,
    a_phone VARCHAR(20)
);

-- Service table for accommodations
CREATE TABLE Service (
    s_id SERIAL PRIMARY KEY,
    s_name VARCHAR(255),
    s_type VARCHAR(100),
    location VARCHAR(255),
    check_in DATE,
    check_out DATE,
    status VARCHAR(50),
    price DECIMAL(10, 2),
    admin_id INT,
    FOREIGN KEY (admin_id) REFERENCES Admin(a_id)
);

-- Customer management
CREATE TABLE Customer (
    c_id SERIAL PRIMARY KEY,
    c_name VARCHAR(255),
    c_email VARCHAR(255) UNIQUE,
    c_phone VARCHAR(20),
    c_address TEXT
);

-- Reservation tracking
CREATE TABLE Reservation (
    reservation_id SERIAL PRIMARY KEY,
    date DATE,
    payment_status VARCHAR(50),
    s_id INT,
    c_id INT,
    service_type VARCHAR(100),
    price DECIMAL(10, 2),
    admin_id INT,
    FOREIGN KEY (s_id) REFERENCES Service(s_id),
    FOREIGN KEY (c_id) REFERENCES Customer(c_id),
    FOREIGN KEY (admin_id) REFERENCES Admin(a_id)
);

-- Payment records
CREATE TABLE Payment (
    payment_id SERIAL PRIMARY KEY,
    payment_method VARCHAR(100),
    amount DECIMAL(10, 2),
    payment_date DATE,
    reservation_id INT,
    FOREIGN KEY (reservation_id) REFERENCES Reservation(reservation_id)
);
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Booking-System
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Environment Setup

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration (for future database integration)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Structure

```
Booking-System/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin dashboard pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout with navigation
│   └── page.tsx           # Main booking page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── ResortCard.tsx    # Resort display card
│   ├── BookingForm.tsx   # Booking form modal
│   └── SearchAndFilter.tsx # Search and filter interface
├── lib/                  # Utility functions
├── public/               # Static assets
└── utils/                # Additional utilities
```

## Key Components

### ResortCard
Displays individual resort information with:
- Service details and pricing
- Availability status
- Amenities and ratings
- Booking action button

### BookingForm
Comprehensive booking modal with:
- Customer information collection
- Date selection and validation
- Guest count and special requests
- Payment method selection
- Dynamic price calculation

### SearchAndFilter
Advanced search interface featuring:
- Real-time search input
- Service type filtering
- Location-based filtering
- Price range selection
- Active filter display

### Admin Dashboard
Full-featured admin panel with:
- Dashboard overview with statistics
- Service management interface
- Reservation tracking table
- Customer database management
- Payment status monitoring

## Usage

### For Customers
1. **Browse Services**: Use the search and filter options to find accommodations
2. **View Details**: Click on service cards to see full information
3. **Make Booking**: Click "Book Now" to open the booking form
4. **Complete Reservation**: Fill in details and confirm booking

### For Administrators
1. **Access Admin Panel**: Navigate to `/admin` route
2. **Manage Services**: Add, edit, or remove service offerings
3. **Track Reservations**: Monitor all bookings and their status
4. **Customer Management**: Maintain customer database
5. **View Analytics**: Check revenue and booking statistics

## Customization

### Adding New Service Types
1. Update the service types array in `SearchAndFilter.tsx`
2. Add corresponding icons in the location icon function
3. Update the admin service creation form

### Modifying the Booking Form
1. Edit `BookingForm.tsx` to add new fields
2. Update the `BookingFormData` interface
3. Modify validation logic as needed

### Styling Changes
1. Modify `app/globals.css` for global styles
2. Update component-specific Tailwind classes
3. Customize shadcn/ui theme in `components.json`

## Future Enhancements

- [ ] **Real-time Availability**: Live booking status updates
- [ ] **User Authentication**: Customer login and account management
- [ ] **Review System**: Customer ratings and feedback
- [ ] **Email Notifications**: Booking confirmations and reminders
- [ ] **Mobile App**: React Native companion app
- [ ] **Multi-language Support**: Internationalization
- [ ] **Advanced Analytics**: Detailed reporting and insights
- [ ] **API Integration**: Third-party service connections

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**
