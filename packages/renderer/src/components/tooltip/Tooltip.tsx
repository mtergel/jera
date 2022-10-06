import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import styles from './tooltip.module.scss';

interface TooltipProps {
  tooltip: string;
}
const Tooltip: React.FC<React.PropsWithChildren<TooltipProps>> = ({tooltip, children}) => {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          sideOffset={3}
          className={styles.content}
        >
          <span>{tooltip}</span>
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
};

export default Tooltip;
