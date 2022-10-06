import {cloneElement, forwardRef, isValidElement} from 'react';
import Tooltip from '../tooltip/Tooltip';
import styles from './iconButton.module.scss';

interface ButtonOptions {
  label: string;
}

type ButtonProps = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> &
  ButtonOptions;
type Ref = HTMLButtonElement;

const IconButton = forwardRef<Ref, ButtonProps>((props, ref) => {
  const {children, label, ...rest} = props;
  const _children = isValidElement(children)
    ? cloneElement(children, {
        'aria-hidden': true,
        focusable: false,
      })
    : null;

  return (
    <Tooltip tooltip={label}>
      <button
        ref={ref}
        className={styles.iconButton}
        aria-label={label}
        {...rest}
      >
        {_children}
      </button>
    </Tooltip>
  );
});

export default IconButton;
