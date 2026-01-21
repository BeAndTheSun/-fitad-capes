import { Cross1Icon } from '@radix-ui/react-icons';
import { AxiosError } from 'axios';
import { useTranslation } from 'next-i18next';
import type { FC } from 'react';
import { useState } from 'react';
import { z } from 'zod';

import { useGenerateReport } from '@/client-common/sdk/reports';
import { useSessionUser } from '@/components/user/user-context';
import { Button } from '@/theme/components/ui/button';
import { toast } from '@/theme/components/ui/use-toast';
import { cn } from '@/theme/utils';
import { useFormHelper } from '@/ui/form-hook-helper';

type Props = {
  onReportGenerated: () => void;
};

export const GenerateReportSidebar: FC<Props> = ({ onReportGenerated }) => {
  const { mutateAsync } = useGenerateReport();
  const [isOpen, setIsOpen] = useState(false);
  const { selectedWorkspace } = useSessionUser();
  const { t } = useTranslation();

  const reportFormSchema = z.object({
    name: z.string().min(1, t('Name is required')),
    table: z.string().min(1, t('Table selection is required')),
    dateRange: z
      .string()
      .min(1, t('Date range is required'))
      .refine(
        (val) => ['24hours', '7days', '30days', 'customRange'].includes(val),
        {
          message: t('Please select a valid date range'),
        }
      ),
    dateFrom: z.coerce.date(),
    dateTo: z.coerce.date(),
    exportFormat: z.enum(['excel', 'pdf'], {
      required_error: t('Export format is required'),
    }),
  });

  type FormValues = z.infer<typeof reportFormSchema>;

  const handleGenerateReport = async (values: FormValues): Promise<void> => {
    try {
      let { dateFrom, dateTo } = values;
      const { dateRange } = values;

      switch (dateRange) {
        case '24hours':
          dateFrom = new Date();
          dateFrom.setHours(dateFrom.getHours() - 24);
          dateTo = new Date();
          break;
        case '7days':
          dateFrom = new Date();
          dateFrom.setDate(dateFrom.getDate() - 7);
          dateTo = new Date();
          break;
        case '30days':
          dateFrom = new Date();
          dateFrom.setDate(dateFrom.getDate() - 30);
          dateTo = new Date();
          break;
        default:
          break;
      }

      await mutateAsync({
        ...values,
        to: dateTo.toISOString(),
        from: dateFrom.toISOString(),
        workspaceId: selectedWorkspace?.id || '',
      });

      toast({
        title: 'Success',
        description: t(
          "Generating report. You'll be able to download it once it's ready"
        ),
        variant: 'default',
      });

      onReportGenerated();
      setIsOpen(false);
    } catch (e) {
      if (e instanceof AxiosError && e.response?.status === 404) {
        toast({
          title: 'Error',
          description: t(
            'No data found in the specified date range for the selected table'
          ),
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: t('An error occurred'),
          variant: 'destructive',
        });
      }
    }
  };
  const { formComponent, form } = useFormHelper(
    {
      schema: reportFormSchema,
      fields: [
        {
          name: 'name',
          label: t('Name'),
          type: 'text',
          required: true,
        },
        {
          name: 'table',
          label: t('Select Table'),
          type: 'select',
          options: [{ value: 'venue', label: t('Venues') }],
          required: true,
        },
        {
          name: 'dateRange',
          label: t('Date Range'),
          type: 'select',
          options: [
            { value: '24hours', label: t('Last 24 hours') },
            { value: '7days', label: t('Last 7 days') },
            { value: '30days', label: t('Last 30 days') },
            { value: 'customRange', label: t('Custom Range') },
          ],
          required: true,
        },
        {
          name: 'dateFrom',
          type: 'date',
          label: t('Start date'),
          size: 'full',
          dependsOn: {
            field: 'dateRange',
            value: 'customRange',
          },
          required: true,
        },
        {
          name: 'dateTo',
          type: 'date',
          label: t('End date'),
          size: 'full',
          dependsOn: {
            field: 'dateRange',
            value: 'customRange',
          },
          required: true,
        },
        {
          name: 'exportFormat',
          label: t('Export Format'),
          type: 'select',
          options: [
            { value: 'excel', label: t('Excel') },
            {
              value: 'pdf',
              label: `${t('PDF')} - ${t('Coming soon')}`,
              isDisabled: true,
            },
          ],
          required: true,
        },
      ],
      onSubmit: async (values) => {
        await handleGenerateReport({
          ...values,
        });
        form.reset();
      },
    },
    {
      defaultValues: {
        name: '',
        table: '',
        exportFormat: undefined,
        dateRange: '',
        dateFrom: new Date(),
        dateTo: new Date(),
      },
    }
  );
  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>{t('Generate Report')}</Button>
      {isOpen && (
        <div
          role="presentation"
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={cn(
          'fixed top-0 right-0 h-full w-80 md:w-96 bg-white dark:bg-gray-950 shadow-lg z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex h-full flex-col p-6">
          <div className="flex items-center justify-end">
            <Button onClick={() => setIsOpen(false)}>
              <Cross1Icon />
            </Button>
          </div>
          <div className="mb-6 flex items-center justify-between">
            {formComponent}
          </div>
        </div>
      </div>
    </div>
  );
};
