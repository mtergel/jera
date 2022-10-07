import IconButton from '/@/components/button/IconButton';

interface SectionHeaderProps {
  title: string;
  actions?: SectionAction[];
}

const SectionHeader: React.FC<React.PropsWithChildren<SectionHeaderProps>> = ({title, actions}) => {
  return (
    <div className="mb-1 flex items-center justify-between">
      <span className="text-sm font-semibold text-t-muted">{title}</span>
      {actions && (
        <div className="flex-shrink-0 flex items-center gap-1">
          {actions.map(action => (
            <IconButton
              label={action.name}
              key={action.name}
              onClick={action.onClick}
            >
              <action.icon />
            </IconButton>
          ))}
        </div>
      )}
    </div>
  );
};

export default SectionHeader;
