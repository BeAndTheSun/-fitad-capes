import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import { z } from 'zod';

import {
  Button,
  Combobox,
  DateRangePicker,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
} from '@/theme/index';

const VenueValidator = z.object({
  name: z.string().min(1, 'Name is required').max(256),
  description: z.string().min(1, 'Description is required').max(256),
  logo_file: z.instanceof(File).optional(),
  brand_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Brand color is required'),
  address: z.string().min(1, 'Address is required').max(256),
  city: z.string().min(1, 'City is required').max(128),
  country: z.string().min(1, 'Country is required').max(128),
  isActive: z.boolean().default(false).optional(),
  phone_number: z.string().max(128).optional(),
  company_website: z.string().max(256).optional(),
  superfit_menu_link: z.string().max(256).optional(),
  social_media_page: z.string().max(256).optional(),
  start_event_time: z.date().optional(),
  end_event_time: z.date().optional(),
  ownerId: z.string().optional(),
  event_date_range: z
    .object({
      from: z.date(),
      to: z.date().optional(),
    })
    .optional(),
});

export type VenueFormValues = z.infer<typeof VenueValidator>;

export type Venue = {
  id: string;
  createdAt: string | null;
  name: string;
  description?: string | null;
  logo_file?: string | null;
  brand_color?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  ownerId?: string | null;
  invitation_token?: string | null;
  isActive: boolean;
  start_event_time?: Date | null;
  end_event_time?: Date | null;
  checking_token?: string | null;
  phone_number?: string | null;
  company_website?: string | null;
  superfit_menu_link?: string | null;
  social_media_page?: string | null;
};

type User = {
  id: string;
  label: string;
};

type VenueFormProps = {
  data?: Venue;
  handleSubmit: (data: VenueFormValues) => void;
  isLoading: boolean;
  showOwnerSelect?: boolean;
  users?: User[];
};

export const VenueForm = ({
  data,
  handleSubmit,
  isLoading,
  users,
  showOwnerSelect = false,
}: VenueFormProps): JSX.Element => {
  const { t } = useTranslation();

  const dynamicSchema = useMemo(() => {
    if (showOwnerSelect) {
      return VenueValidator.extend({
        ownerId: z.string().min(1, t('Select a owner')),
      });
    }
    return VenueValidator;
  }, [showOwnerSelect, t]);

  const venueForm = useForm<VenueFormValues>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      isActive: false,
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (!data) return;

    venueForm.reset({
      name: data.name ?? '',
      description: data.description ?? '',
      brand_color: data.brand_color ?? '',
      address: data.address ?? '',
      city: data.city ?? '',
      country: data.country ?? '',
      isActive: data.isActive ?? false,
      phone_number: data.phone_number ?? '',
      company_website: data.company_website ?? '',
      superfit_menu_link: data.superfit_menu_link ?? '',
      social_media_page: data.social_media_page ?? '',
      ownerId: data.ownerId ?? '',
      event_date_range: data.start_event_time
        ? {
            from: new Date(data.start_event_time),
            to: data.end_event_time ? new Date(data.end_event_time) : undefined,
          }
        : undefined,
    });
  }, [data, venueForm]);
  return (
    <Form {...venueForm}>
      <form
        onSubmit={venueForm.handleSubmit(handleSubmit)}
        className="flex flex-col gap-4"
      >
        <h5 className="text-sm font-bold">
          <Trans>Basic Information</Trans>
        </h5>
        <div className="flex flex-col gap-2 md:flex-row">
          <FormField
            control={venueForm.control}
            name="name"
            render={({ field }): React.ReactElement => (
              <FormItem className="flex-1">
                <FormLabel className="">
                  <Trans>Name</Trans>
                  <span className="ml-1 text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={venueForm.control}
            name="address"
            render={({ field }): React.ReactElement => (
              <FormItem className="flex-1">
                <FormLabel className="">
                  <Trans>Address</Trans>
                  <span className="ml-1 text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col gap-2 md:flex-row">
          <FormField
            control={venueForm.control}
            name="logo_file"
            render={({ field }): React.ReactElement => (
              <FormItem className="flex-1">
                <FormLabel>
                  <Trans>Logo</Trans>
                  <span className="ml-1 text-red-500">*</span>
                </FormLabel>

                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const file = e.target.files?.[0] ?? null;
                      field.onChange(file);
                    }}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={venueForm.control}
            name="brand_color"
            render={({ field }): React.ReactElement => (
              <FormItem className="flex-1">
                <FormLabel className="">
                  <Trans>Brand Color</Trans>
                  <span className="ml-1 text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input type="color" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col gap-2 md:flex-row">
          <FormField
            control={venueForm.control}
            name="city"
            render={({ field }): React.ReactElement => (
              <FormItem className="flex-1">
                <FormLabel className="">
                  <Trans>City</Trans>
                  <span className="ml-1 text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={venueForm.control}
            name="country"
            render={({ field }): React.ReactElement => (
              <FormItem className="flex-1">
                <FormLabel className="">
                  <Trans>Country</Trans>
                  <span className="ml-1 text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-end">
          <FormField
            control={venueForm.control}
            name="event_date_range"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>
                  <Trans>Event date</Trans>
                  <span className="ml-1 text-red-500">*</span>
                </FormLabel>

                <FormControl>
                  <DateRangePicker
                    selected={field.value}
                    onSelect={field.onChange}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={venueForm.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 pb-2">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                </FormControl>

                <FormLabel className="mb-0">
                  <Trans>Is Active</Trans>
                </FormLabel>
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col gap-2 md:flex-row">
          <FormField
            control={venueForm.control}
            name="description"
            render={({ field }): React.ReactElement => (
              <FormItem className="flex-1">
                <FormLabel className="">
                  <Trans>Description</Trans>
                </FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {showOwnerSelect && (
          <>
            <h5 className="text-sm font-bold">
              <Trans>Venue Owner</Trans>
            </h5>
            <div className="flex flex-col gap-2 md:flex-row">
              <FormField
                control={venueForm.control}
                name="ownerId"
                render={({ field }): React.ReactElement => (
                  <FormItem className="flex-1">
                    <FormLabel className="">
                      <Trans>Owner Venue</Trans>
                    </FormLabel>
                    <FormControl>
                      <Combobox
                        options={
                          users?.map((user) => ({
                            label: user.label,
                            value: user.id,
                          })) || []
                        }
                        value={field.value}
                        onSelect={field.onChange}
                        placeholder={t('Select a owner')}
                        inputPlaceholder={t('Search...')}
                        emptyMessage={t('No options found.')}
                        className="w-full"
                        disabled={field.disabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        )}
        <h5 className="text-sm font-bold">
          <Trans>Additional Information</Trans>
        </h5>
        <div className="flex flex-col gap-2 md:flex-row">
          <FormField
            control={venueForm.control}
            name="phone_number"
            render={({ field }): React.ReactElement => (
              <FormItem className="flex-1">
                <FormLabel className="">
                  <Trans>Phone Number</Trans>
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={venueForm.control}
            name="company_website"
            render={({ field }): React.ReactElement => (
              <FormItem className="flex-1">
                <FormLabel className="">
                  <Trans>Company Website</Trans>
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col gap-2 md:flex-row">
          <FormField
            control={venueForm.control}
            name="superfit_menu_link"
            render={({ field }): React.ReactElement => (
              <FormItem className="flex-1">
                <FormLabel className="">
                  <Trans>Superfit Menu Link</Trans>
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={venueForm.control}
            name="social_media_page"
            render={({ field }): React.ReactElement => (
              <FormItem className="flex-1">
                <FormLabel className="">
                  <Trans>Social Media Page</Trans>
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button className="w-auto" type="submit" loading={isLoading}>
          <Trans>Save Changes</Trans>
        </Button>
      </form>
    </Form>
  );
};
