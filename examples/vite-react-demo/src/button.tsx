import * as stylex from '@stylexjs/stylex'
import { ComponentProps } from 'react'
import { colors } from '@/tokens.stylex'
import { fonts } from '@/tokens/nested.stylex'
import { others } from '~/other.stylex'

type ButtonProps = {
  variant?: 'primary',
  children?: React.ReactNode,
  styles?: stylex.StyleXStyles,
} & ComponentProps<'button'>

const baseStyle = {
  borderWidth: '1px',
  borderStyle: 'solid',
  color: colors.primary,
  borderRadius: others.borderRadius,
  cursor: 'pointer',
  padding: '10px 15px',
  fontSize: fonts.font
}

const s = stylex.create({
  base: baseStyle,
  primary: {
    borderColor: {
      default: colors.primary
    },
    color: {
      default: colors.black
    },
    backgroundColor: {
      default: colors.primary,
      ':hover': colors.primaryDark,
      ':focus': colors.primaryDark,
      ':active': colors.primaryDark
    }
  }
})

const Button = ({ variant = 'primary', styles, ...props }: ButtonProps) => (
  <button type="button" {...stylex.props(s.base, s[variant], styles)} {...props} />
)

export default Button
