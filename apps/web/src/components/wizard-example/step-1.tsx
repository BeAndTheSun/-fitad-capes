import { Trans } from 'next-i18next';

const WizardWorkspaceProfileStep1: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold">
        <Trans>Welcome to the Workspace Creation Wizard!</Trans>
      </h2>
      <p className="mt-2">
        <Trans>
          In just a few easy steps, you&apos;ll set up a workspace. This wizard
          will guide you through
        </Trans>
        :
      </p>
      <ul className="mt-2 list-inside list-disc">
        <li>
          <Trans>Adding a name and description to your workspace</Trans>
        </li>
        <li>
          <Trans>Setting up a logo to your workspace</Trans>
        </li>
        <li>
          <Trans>Adding links for different social networks</Trans>
        </li>
        <li>
          <Trans>Adding members</Trans>
        </li>
      </ul>
      <p className="mt-4">
        <Trans>Let’s get started on building your workspace!</Trans>
      </p>
    </div>
  );
};

export { WizardWorkspaceProfileStep1 };
