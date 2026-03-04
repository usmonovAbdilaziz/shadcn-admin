import { createFileRoute } from '@tanstack/react-router';
import { Dashboard as BusinessDashboard } from '../business/dashboard';

export const Route = createFileRoute('/_authenticated/business')({
  component: BusinessDashboard,
});
