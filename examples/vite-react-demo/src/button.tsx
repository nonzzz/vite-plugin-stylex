import { colors } from '@/tokens.stylex'
import { fonts } from '@/tokens/nested.stylex'
import { others } from '~/other.stylex'

const Button = (props: any) => (
  <button
    type="button"
    stylex={{
      borderWidth: '1px',
      borderStyle: 'solid',
      color: colors.black,
      borderRadius: others.borderRadius,
      cursor: 'pointer',
      padding: '10px 15px',
      fontSize: fonts.font,
      backgroundColor: {
        default: colors.primary,
        ':hover': colors.primaryDark
      }
    }}
  >
    {props?.children}
  </button>
)

export default Button
