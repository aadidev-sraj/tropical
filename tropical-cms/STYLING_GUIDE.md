# Tropical CMS - Styling Guide

## Design System

The admin panel now uses the same design system as the main Tropical website for a consistent brand experience.

### Color Palette

```css
/* Primary Colors */
--primary: hsl(0, 0%, 9%)           /* Black - Main brand color */
--accent: hsl(140, 22%, 28%)        /* #40513E - Tropical Green */
--background: hsl(0, 0%, 100%)      /* White */
--foreground: hsl(0, 0%, 3%)        /* Near Black */

/* Secondary Colors */
--secondary: hsl(0, 0%, 96%)        /* Light Gray */
--muted: hsl(0, 0%, 96%)            /* Muted Background */
--muted-foreground: hsl(0, 0%, 45%) /* Muted Text */

/* Semantic Colors */
--destructive: hsl(0, 84%, 60%)     /* Red for delete/danger */
--success: hsl(142, 71%, 45%)       /* Green for success */
--warning: hsl(45, 93%, 47%)        /* Yellow for warnings */
--info: hsl(199, 89%, 48%)          /* Blue for info */

/* UI Elements */
--border: hsl(0, 0%, 90%)           /* Border color */
--input: hsl(0, 0%, 90%)            /* Input borders */
--ring: hsl(0, 0%, 9%)              /* Focus rings */
```

### Typography

- **Font Family**: System fonts (-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', etc.)
- **Headings**: Bold (700), tight letter-spacing (-0.025em)
- **Body**: Normal (400-500), slight letter-spacing (-0.01em)

### Components

#### Buttons

**Primary Button** (Black → Green on hover)
```css
background: hsl(var(--primary))
hover: hsl(var(--accent)) with lift effect
```

**Secondary Button** (Light gray with border)
```css
background: hsl(var(--secondary))
border: hsl(var(--border))
```

**Danger Button** (Red)
```css
background: hsl(var(--destructive))
```

**Success Button** (Green)
```css
background: hsl(var(--success))
```

#### Sidebar

- **Background**: Black `hsl(var(--primary))`
- **Active Link**: Tropical Green `hsl(var(--accent))`
- **Hover**: Slightly lighter black

#### Cards & Modals

- **Background**: White
- **Border**: Light gray `hsl(var(--border))`
- **Shadow**: Subtle elevation
- **Radius**: 4px (`var(--radius)`)

#### Forms

- **Input Border**: Light gray
- **Focus**: Black ring with subtle shadow
- **Labels**: Medium weight (500)

### Animations

All transitions use:
```css
transition: var(--transition-smooth);
/* 0.3s cubic-bezier(0.4, 0, 0.2, 1) */
```

Hover effects include:
- `transform: translateY(-1px)` - Subtle lift
- Enhanced shadows
- Color transitions

### Layout

- **Sidebar Width**: 250px
- **Main Content**: Light gray background `hsl(var(--secondary))`
- **Padding**: Consistent 2rem for main content
- **Gap**: 1.5rem for grids

### Status Badges

Match the main website's order status colors:
- **Pending**: Yellow background
- **Confirmed**: Light blue
- **Processing**: Blue
- **Shipped/Delivered**: Green
- **Cancelled**: Red

### Responsive Design

- Grid layouts use `auto-fit` with minimum 250-280px columns
- Mobile-friendly spacing
- Touch-friendly button sizes (min 44x44px)

## Usage Examples

### Using Design Tokens

```css
/* Good - Use CSS variables */
.my-component {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border: 1px solid hsl(var(--border));
  transition: var(--transition-smooth);
}

/* Avoid - Hard-coded colors */
.my-component {
  background-color: #000;
  color: #fff;
  border: 1px solid #ddd;
}
```

### Button Styling

```jsx
<button className="btn btn-primary">Primary Action</button>
<button className="btn btn-secondary">Secondary Action</button>
<button className="btn btn-danger">Delete</button>
<button className="btn btn-success">Confirm</button>
```

### Form Styling

```jsx
<div className="form-group">
  <label htmlFor="name">Product Name</label>
  <input
    type="text"
    id="name"
    className="form-control"
    placeholder="Enter product name"
  />
</div>
```

## Consistency with Main Website

The admin panel now matches the Tropical website in:

1. **Color Scheme**: Black primary, green accent (#40513E)
2. **Typography**: Bold headings with tight tracking
3. **Spacing**: Consistent padding and margins
4. **Shadows**: Subtle elevation effects
5. **Transitions**: Smooth 0.3s cubic-bezier animations
6. **Border Radius**: 4px for all components

## Future Enhancements

Consider adding:
- Dark mode support (already defined in design tokens)
- Custom animations matching main site
- Brand-specific illustrations
- Loading states with branded colors
- Toast notifications with consistent styling
