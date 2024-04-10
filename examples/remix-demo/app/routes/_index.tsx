import type { MetaFunction } from '@remix-run/node'
import { create, props } from '@stylexjs/stylex'
import Card from '~/Card'

export const meta: MetaFunction = () => {
  return [
    { title: 'New Remix App' },
    { name: 'description', content: 'Welcome to Remix!' }
  ]
}

const styles = create({
  color: {
    color: 'lch(from red calc(l + 10%) c h)'
  }
})

//  color: 'lch(from green calc(l + 10%) c h)',

export default function Index() {
  return (
    <Card>
      Remix App with StyleX!
      <div {...props(styles.color)}>
        Hello Worlod
      </div>
    </Card>
  )
}
