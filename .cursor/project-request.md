# Junction Bank

## Project Description

A web application for tracking personal expenses and income, categorizing spending, and generating monthly and yearly reports. The app will handle both CAD and USD currencies with automatic conversion and support recurring transactions through a Monthly Template system.

## Target Audience

- Personal users tracking their finances
- Two specific users (no public registration)

## Desired Features

### Authentication

- [ ] Supabase authentication
- [ ] Login for two existing users only
- [ ] No public registration

### Expense Management

- [ ] Add expenses with:
  - [ ] Name/description
  - [ ] Amount in CAD (mandatory)
  - [ ] Amount in USD (optional)
  - [ ] Category
  - [ ] Optional notes field
  - [ ] Date
- [ ] Automatic conversion from USD to CAD when only USD is provided
- [ ] Edit and delete expenses

### Income Tracking

- [ ] Add income entries with:
  - [ ] Name/description
  - [ ] Amount in CAD (mandatory)
  - [ ] Amount in USD (optional)
  - [ ] Category
  - [ ] Notes field
  - [ ] Date
- [ ] Automatic conversion from USD to CAD when only USD is provided
- [ ] Edit and delete income entries

### Category Management

- [ ] Dedicated UI screen for category management
- [ ] Create new expense and income categories
- [ ] Edit existing categories
- [ ] Delete categories (with handling for already categorized items)

### Monthly Template System

- [ ] "New Month" button to create a new month tracking period
- [ ] Preview of recurring transactions before creation
- [ ] Modal with:
  - [ ] Pre-populated current month and year fields (editable)
  - [ ] Optional notes field for the month
  - [ ] Create/Cancel buttons
- [ ] Automatic population of recurring expenses and income from template
- [ ] Ability to mark transactions as recurring (to include in future month templates)
- [ ] Ability to edit/remove specific recurring transactions for a month
- [ ] Ability to permanently remove items from recurring template

### Reporting

- [ ] Monthly reports
  - [ ] Total spent
  - [ ] Total income
  - [ ] Net savings/overspending
  - [ ] Expenses grouped by category
  - [ ] Income grouped by category
  - [ ] Highlight highest spending categories
  - [ ] Month-over-month comparison for partial months (e.g., spending up to the 18th compared to spending up to the 18th last month)
- [ ] Yearly reports
  - [ ] Annual summary
  - [ ] Monthly breakdown
  - [ ] Category trends throughout the year
- [ ] Filtering options by category for all reports

### Visualizations

- [ ] Monthly expense breakdown pie chart
- [ ] Income vs. expense bar chart
- [ ] Category spending comparison chart
- [ ] Monthly spending trend line chart
- [ ] Year-to-date summary dashboard
- [ ] Month-over-month spending comparison chart
- [ ] Category filter controls for all visualizations

## Design Requests

- [ ] Built with Next.js
- [ ] Styled with Tailwind CSS and shadcn/ui
- [ ] Minimal modern UI
- [ ] Light and dark mode support
- [ ] Responsive design for all device sizes
- [ ] Trustworthy and reliable aesthetic
- [ ] Intuitive user interface
- [ ] Dashboard view for quick financial overview

## Technical Requirements

- [ ] Postgres database on Supabase
- [ ] Deployment on Vercel
- [ ] Integration with free currency exchange rate API
- [ ] Shared currency conversion service for both expenses and income

## Other Notes

- This is a personal finance tool for private use by two specific users
- Focus on simplicity and ease of use over complex features
- No need for budget planning features
- No receipt attachments needed
- No import/export functionality required for the initial version
- No need for complex search/filtering systems
- No need for notifications or reminders
- No month "closing" functionality needed
