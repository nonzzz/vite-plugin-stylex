import * as stylex from '@stylexjs/stylex'

const blackA = {
  blackA1: 'color(display-p3 0 0 0 / 0.05)',
  blackA2: 'color(display-p3 0 0 0 / 0.1)',
  blackA3: 'color(display-p3 0 0 0 / 0.15)',
  blackA4: 'color(display-p3 0 0 0 / 0.2)',
  blackA5: 'color(display-p3 0 0 0 / 0.3)',
  blackA6: 'color(display-p3 0 0 0 / 0.4)',
  blackA7: 'color(display-p3 0 0 0 / 0.5)',
  blackA8: 'color(display-p3 0 0 0 / 0.6)',
  blackA9: 'color(display-p3 0 0 0 / 0.7)',
  blackA10: 'color(display-p3 0 0 0 / 0.8)',
  blackA11: 'color(display-p3 0 0 0 / 0.9)',
  blackA12: 'color(display-p3 0 0 0 / 0.95)'
} as const

const whiteA = {
  whiteA1: 'color(display-p3 1 1 1 / 0.05)',
  whiteA2: 'color(display-p3 1 1 1 / 0.1)',
  whiteA3: 'color(display-p3 1 1 1 / 0.15)',
  whiteA4: 'color(display-p3 1 1 1 / 0.2)',
  whiteA5: 'color(display-p3 1 1 1 / 0.3)',
  whiteA6: 'color(display-p3 1 1 1 / 0.4)',
  whiteA7: 'color(display-p3 1 1 1 / 0.5)',
  whiteA8: 'color(display-p3 1 1 1 / 0.6)',
  whiteA9: 'color(display-p3 1 1 1 / 0.7)',
  whiteA10: 'color(display-p3 1 1 1 / 0.8)',
  whiteA11: 'color(display-p3 1 1 1 / 0.9)',
  whiteA12: 'color(display-p3 1 1 1 / 0.95)'
} 

const gray = {
  gray1: 'light-dark( oklch(99.1% 0.001 277.7), oklch(17.8% 0.004 277.7) )',
  gray2: 'light-dark( oklch(98.2% 0.003 277.7), oklch(21.5% 0.004 277.7) )',
  gray3: 'light-dark( oklch(95.6% 0.005 277.7), oklch(25.5% 0.005 277.7) )',
  gray4: 'light-dark( oklch(93.1% 0.006 277.7), oklch(28.4% 0.008 277.7) )',
  gray5: 'light-dark( oklch(91% 0.008 277.7), oklch(31.4% 0.009 277.7) )',
  gray6: 'light-dark( oklch(88.8% 0.009 277.7), oklch(35% 0.01 277.7) )',
  gray7: 'light-dark( oklch(85.3% 0.012 277.7), oklch(40.2% 0.012 277.7) )',
  gray8: 'light-dark( oklch(79.4% 0.016 277.7), oklch(49.2% 0.016 277.7) )',
  gray9: 'light-dark( oklch(64.6% 0.016 277.7), oklch(54% 0.017 277.7) )',
  gray10: 'light-dark( oklch(61% 0.016 277.7), oklch(58.6% 0.016 277.7) )',
  gray11: 'light-dark( oklch(50.3% 0.014 277.7), oklch(77% 0.014 277.7) )',
  gray12: 'light-dark( oklch(24.1% 0.01 277.7), oklch(94.9% 0.003 277.7) )'
} 

const grayA = {
  grayA1: 'light-dark( color(display-p3 0.024 0.024 0.349 / 0.012), color(display-p3 0.067 0.067 0.941 / 0.009) )',
  grayA2: 'light-dark( color(display-p3 0.024 0.024 0.349 / 0.024), color(display-p3 0.8 0.8 0.98 / 0.043) )',
  grayA3: 'light-dark( color(display-p3 0.008 0.067 0.255 / 0.063), color(display-p3 0.851 0.898 0.988 / 0.085) )',
  grayA4: 'light-dark( color(display-p3 0.012 0.051 0.216 / 0.095), color(display-p3 0.839 0.871 1 / 0.122) )',
  grayA5: 'light-dark( color(display-p3 0.004 0.039 0.2 / 0.122), color(display-p3 0.847 0.875 1 / 0.156) )',
  grayA6: 'light-dark( color(display-p3 0.004 0.027 0.18 / 0.153), color(display-p3 0.878 0.898 1 / 0.194) )',
  grayA7: 'light-dark( color(display-p3 0.008 0.027 0.184 / 0.197), color(display-p3 0.875 0.906 0.996 / 0.257) )',
  grayA8: 'light-dark( color(display-p3 0.004 0.031 0.176 / 0.275), color(display-p3 0.894 0.906 1 / 0.37) )',
  grayA9: 'light-dark( color(display-p3 0.004 0.02 0.106 / 0.455), color(display-p3 0.89 0.91 1 / 0.433) )',
  grayA10: 'light-dark( color(display-p3 0.004 0.02 0.098 / 0.499), color(display-p3 0.902 0.918 1 / 0.488) )',
  grayA11: 'light-dark( color(display-p3 0 0.008 0.059 / 0.616), color(display-p3 0.945 0.949 1 / 0.719) )',
  grayA12: 'light-dark( color(display-p3 0 0.004 0.027 / 0.883), color(display-p3 0.992 0.992 1 / 0.937) )'
} 

const indigo = {
  indigo1: 'light-dark( oklch(99.4% 0.001 267), oklch(17.8% 0.025 267) )',
  indigo2: 'light-dark( oklch(98.3% 0.008 267), oklch(20.7% 0.03 267) )',
  indigo3: 'light-dark( oklch(96.1% 0.017 267), oklch(27.1% 0.069 267) )',
  indigo4: 'light-dark( oklch(93.5% 0.034 267), oklch(31.8% 0.093 267) )',
  indigo5: 'light-dark( oklch(90.3% 0.051 267), oklch(36.1% 0.104 267) )',
  indigo6: 'light-dark( oklch(86.3% 0.071 267), oklch(40.4% 0.11 267) )',
  indigo7: 'light-dark( oklch(80.7% 0.087 267), oklch(45% 0.12 267) )',
  indigo8: 'light-dark( oklch(73% 0.113 267), oklch(50.3% 0.137 267) )',
  indigo9: 'light-dark( oklch(54.4% 0.191 267), oklch(54.4% 0.191 267) )',
  indigo10: 'light-dark( oklch(49.7% 0.173 267), oklch(49.7% 0.137 267) )',
  indigo11: 'light-dark( oklch(51% 0.173 267), oklch(77.7% 0.123 267) )',
  indigo12: 'light-dark( oklch(31.3% 0.086 267), oklch(91.1% 0.043 267) )'
} 

const indigoA = {
  indigoA1: 'light-dark( color(display-p3 0.02 0.02 0.51 / 0.008), color(display-p3 0 0.071 0.98 / 0.043) )',
  indigoA2: 'light-dark( color(display-p3 0.02 0.267 0.878 / 0.032), color(display-p3 0.118 0.361 1 / 0.08) )',
  indigoA3: 'light-dark( color(display-p3 0.008 0.239 0.886 / 0.067), color(display-p3 0.227 0.404 1 / 0.223) )',
  indigoA4: 'light-dark( color(display-p3 0.004 0.306 0.937 / 0.118), color(display-p3 0.263 0.42 1 / 0.324) )',
  indigoA5: 'light-dark( color(display-p3 0.004 0.278 0.933 / 0.173), color(display-p3 0.302 0.451 1 / 0.4) )',
  indigoA6: 'light-dark( color(display-p3 0.004 0.247 0.937 / 0.244), color(display-p3 0.353 0.49 1 / 0.467) )',
  indigoA7: 'light-dark( color(display-p3 0.004 0.22 0.871 / 0.326), color(display-p3 0.376 0.514 1 / 0.543) )',
  indigoA8: 'light-dark( color(display-p3 0.004 0.196 0.808 / 0.444), color(display-p3 0.396 0.529 1 / 0.648) )',
  indigoA9: 'light-dark( color(display-p3 0 0.153 0.773 / 0.726), color(display-p3 0.318 0.451 1 / 0.824) )',
  indigoA10: 'light-dark( color(display-p3 0 0.129 0.655 / 0.761), color(display-p3 0.384 0.518 1 / 0.643) )',
  indigoA11: 'light-dark( color(display-p3 0 0.133 0.667 / 0.746), color(display-p3 0.62 0.722 1 / 0.975) )',
  indigoA12: 'light-dark( color(display-p3 0 0.059 0.255 / 0.875), color(display-p3 0.855 0.898 1 / 0.988) )'
} 

const blue = {
  blue1: 'light-dark( oklch(99.4% 0.002 262.6), oklch(17.8% 0.032 262.6) )',
  blue2: 'light-dark( oklch(98.3% 0.01 262.6), oklch(20.7% 0.038 262.6) )',
  blue3: 'light-dark( oklch(96.1% 0.021 262.6), oklch(27.1% 0.088 262.6) )',
  blue4: 'light-dark( oklch(93.5% 0.042 262.6), oklch(31.8% 0.119 262.6) )',
  blue5: 'light-dark( oklch(90.3% 0.064 262.6), oklch(36.1% 0.133 262.6) )',
  blue6: 'light-dark( oklch(86.3% 0.089 262.6), oklch(40.4% 0.141 262.6) )',
  blue7: 'light-dark( oklch(80.7% 0.109 262.6), oklch(45% 0.153 262.6) )',
  blue8: 'light-dark( oklch(73% 0.142 262.6), oklch(50.3% 0.175 262.6) )',
  blue9: 'light-dark( oklch(50.2% 0.244 262.6), oklch(50.2% 0.244 262.6) )',
  blue10: 'light-dark( oklch(45.2% 0.244 262.6), oklch(45.2% 0.244 262.6) )',
  blue11: 'light-dark( oklch(51% 0.216 262.6), oklch(77.7% 0.157 262.6) )',
  blue12: 'light-dark( oklch(31.3% 0.107 262.6), oklch(91.1% 0.055 262.6) )'
} 

const blueA = {
  blueA1: 'light-dark( color(display-p3 0.024 0.349 0.675 / 0.012), color(display-p3 0 0.071 0.996 / 0.055) )',
  blueA2: 'light-dark( color(display-p3 0.02 0.388 0.878 / 0.032), color(display-p3 0.027 0.31 1 / 0.097) )',
  blueA3: 'light-dark( color(display-p3 0.008 0.357 0.953 / 0.079), color(display-p3 0.098 0.325 0.996 / 0.257) )',
  blueA4: 'light-dark( color(display-p3 0.008 0.349 0.941 / 0.126), color(display-p3 0.118 0.349 1 / 0.374) )',
  blueA5: 'light-dark( color(display-p3 0.008 0.337 0.941 / 0.189), color(display-p3 0.173 0.388 1 / 0.454) )',
  blueA6: 'light-dark( color(display-p3 0.004 0.337 0.945 / 0.271), color(display-p3 0.22 0.427 1 / 0.526) )',
  blueA7: 'light-dark( color(display-p3 0.004 0.314 0.949 / 0.365), color(display-p3 0.251 0.455 0.996 / 0.614) )',
  blueA8: 'light-dark( color(display-p3 0.004 0.286 0.945 / 0.495), color(display-p3 0.263 0.463 0.996 / 0.732) )',
  blueA9: 'light-dark( color(display-p3 0 0.204 0.871 / 0.879), color(display-p3 0.129 0.333 1 / 0.879) )',
  blueA10: 'light-dark( color(display-p3 0 0.161 0.804 / 0.914), color(display-p3 0.094 0.275 1 / 0.807) )',
  blueA11: 'light-dark( color(display-p3 0 0.204 0.812 / 0.832), color(display-p3 0.569 0.722 1 / 0.975) )',
  blueA12: 'light-dark( color(display-p3 0 0.086 0.322 / 0.906), color(display-p3 0.839 0.894 1 / 0.988) )'
} 

const red = {
  red1: 'light-dark( oklch(99.4% 0.003 26.52), oklch(17.8% 0.015 26.52) )',
  red2: 'light-dark( oklch(98.3% 0.009 26.52), oklch(20.4% 0.023 26.52) )',
  red3: 'light-dark( oklch(95.6% 0.024 26.52), oklch(25% 0.07 26.52) )',
  red4: 'light-dark( oklch(92.8% 0.053 26.52), oklch(28.9% 0.106 26.52) )',
  red5: 'light-dark( oklch(89.5% 0.069 26.52), oklch(33.1% 0.118 26.52) )',
  red6: 'light-dark( oklch(85.6% 0.084 26.52), oklch(38.2% 0.122 26.52) )',
  red7: 'light-dark( oklch(80.6% 0.101 26.52), oklch(45% 0.132 26.52) )',
  red8: 'light-dark( oklch(74.4% 0.128 26.52), oklch(54.2% 0.161 26.52) )',
  red9: 'light-dark( oklch(61.5% 0.218 26.52), oklch(61.5% 0.218 26.52) )',
  red10: 'light-dark( oklch(57.3% 0.221 26.52), oklch(57.3% 0.218 26.52) )',
  red11: 'light-dark( oklch(55.9% 0.218 26.52), oklch(78.4% 0.183 26.52) )',
  red12: 'light-dark( oklch(34.1% 0.114 26.52), oklch(90.1% 0.057 26.52) )'
} 

const redA = {
  redA1: 'light-dark( color(display-p3 0.675 0.024 0.024 / 0.012), color(display-p3 0.961 0 0 / 0.022) )',
  redA2: 'light-dark( color(display-p3 0.894 0.129 0.024 / 0.036), color(display-p3 0.996 0.282 0.071 / 0.055) )',
  redA3: 'light-dark( color(display-p3 0.867 0.145 0.012 / 0.087), color(display-p3 1 0.141 0.043 / 0.164) )',
  redA4: 'light-dark( color(display-p3 0.851 0.129 0.004 / 0.157), color(display-p3 0.996 0.067 0.024 / 0.253) )',
  redA5: 'light-dark( color(display-p3 0.863 0.145 0.004 / 0.224), color(display-p3 0.996 0.165 0.118 / 0.316) )',
  redA6: 'light-dark( color(display-p3 0.867 0.125 0.004 / 0.291), color(display-p3 1 0.282 0.22 / 0.387) )',
  redA7: 'light-dark( color(display-p3 0.824 0.11 0.004 / 0.373), color(display-p3 1 0.365 0.306 / 0.488) )',
  redA8: 'light-dark( color(display-p3 0.78 0.098 0.004 / 0.483), color(display-p3 1 0.396 0.341 / 0.656) )',
  redA9: 'light-dark( color(display-p3 0.8 0.043 0 / 0.757), color(display-p3 1 0.314 0.278 / 0.837) )',
  redA10: 'light-dark( color(display-p3 0.749 0.02 0 / 0.812), color(display-p3 1 0.251 0.227 / 0.778) )',
  redA11: 'light-dark( color(display-p3 0.725 0.02 0 / 0.824), color(display-p3 1 0.616 0.557 / 0.937) )',
  redA12: 'light-dark( color(display-p3 0.302 0.016 0 / 0.902), color(display-p3 1 0.851 0.824 / 0.971) )'
} 

const green = {
  green1: 'light-dark( oklch(99.4% 0.004 157.2), oklch(17.8% 0.016 157.2) )',
  green2: 'light-dark( oklch(98.2% 0.008 157.2), oklch(21% 0.018 157.2) )',
  green3: 'light-dark( oklch(95.9% 0.02 157.2), oklch(26.9% 0.042 157.2) )',
  green4: 'light-dark( oklch(93.3% 0.032 157.2), oklch(31.8% 0.067 157.2) )',
  green5: 'light-dark( oklch(90% 0.045 157.2), oklch(36.5% 0.078 157.2) )',
  green6: 'light-dark( oklch(85.7% 0.059 157.2), oklch(41.5% 0.088 157.2) )',
  green7: 'light-dark( oklch(79.8% 0.077 157.2), oklch(46.8% 0.101 157.2) )',
  green8: 'light-dark( oklch(71.5% 0.103 157.2), oklch(52.6% 0.117 157.2) )',
  green9: 'light-dark( oklch(49.9% 0.117 157.2), oklch(49.9% 0.117 157.2) )',
  green10: 'light-dark( oklch(44.8% 0.117 157.2), oklch(44.8% 0.101 157.2) )',
  green11: 'light-dark( oklch(52.8% 0.117 157.2), oklch(78% 0.117 157.2) )',
  green12: 'light-dark( oklch(32.3% 0.043 157.2), oklch(90.8% 0.097 157.2) )'
} 

const greenA = {
  greenA1: 'light-dark( color(display-p3 0.024 0.675 0.024 / 0.012), color(display-p3 0 0.941 0 / 0.009) )',
  greenA2: 'light-dark( color(display-p3 0.024 0.565 0.129 / 0.036), color(display-p3 0.251 0.98 0.435 / 0.043) )',
  greenA3: 'light-dark( color(display-p3 0.008 0.576 0.153 / 0.083), color(display-p3 0.353 0.996 0.569 / 0.11) )',
  greenA4: 'light-dark( color(display-p3 0.008 0.533 0.125 / 0.134), color(display-p3 0.29 1 0.533 / 0.177) )',
  greenA5: 'light-dark( color(display-p3 0.008 0.506 0.125 / 0.197), color(display-p3 0.353 1 0.584 / 0.236) )',
  greenA6: 'light-dark( color(display-p3 0.004 0.482 0.133 / 0.271), color(display-p3 0.404 1 0.612 / 0.303) )',
  greenA7: 'light-dark( color(display-p3 0.004 0.443 0.129 / 0.373), color(display-p3 0.427 1 0.627 / 0.37) )',
  greenA8: 'light-dark( color(display-p3 0 0.439 0.137 / 0.518), color(display-p3 0.435 1 0.643 / 0.45) )',
  greenA9: 'light-dark( color(display-p3 0 0.318 0.118 / 0.8), color(display-p3 0.388 1 0.616 / 0.416) )',
  greenA10: 'light-dark( color(display-p3 0 0.275 0.086 / 0.832), color(display-p3 0.4 1 0.616 / 0.345) )',
  greenA11: 'light-dark( color(display-p3 0 0.333 0.118 / 0.765), color(display-p3 0.659 1 0.765 / 0.786) )',
  greenA12: 'light-dark( color(display-p3 0 0.086 0.027 / 0.851), color(display-p3 0.765 1 0.831 / 0.95) )'
} 

const accent = {
  accent1: blue.blue1,
  accent2: blue.blue2,
  accent3: blue.blue3,
  accent4: blue.blue4,
  accent5: blue.blue5,
  accent6: blue.blue6,
  accent7: blue.blue7,
  accent8: blue.blue8,
  accent9: blue.blue9,
  accent10: blue.blue10,
  accent11: blue.blue11,
  accent12: blue.blue12
}

const accentA = {
  accentA1: blueA.blueA1,
  accentA2: blueA.blueA2,
  accentA3: blueA.blueA3,
  accentA4: blueA.blueA4,
  accentA5: blueA.blueA5,
  accentA6: blueA.blueA6,
  accentA7: blueA.blueA7,
  accentA8: blueA.blueA8,
  accentA9: blueA.blueA9,
  accentA10: blueA.blueA10,
  accentA11: blueA.blueA11,
  accentA12: blueA.blueA12
}

const supportive = {
  supportive1: indigo.indigo1,
  supportive2: indigo.indigo2,
  supportive3: indigo.indigo3,
  supportive4: indigo.indigo4,
  supportive5: indigo.indigo5,
  supportive6: indigo.indigo6,
  supportive7: indigo.indigo7,
  supportive8: indigo.indigo8,
  supportive9: indigo.indigo9,
  supportive10: indigo.indigo10,
  supportive11: indigo.indigo11,
  supportive12: indigo.indigo12
}

const supportiveA = {
  supportiveA1: indigoA.indigoA1,
  supportiveA2: indigoA.indigoA2,
  supportiveA3: indigoA.indigoA3,
  supportiveA4: indigoA.indigoA4,
  supportiveA5: indigoA.indigoA5,
  supportiveA6: indigoA.indigoA6,
  supportiveA7: indigoA.indigoA7,
  supportiveA8: indigoA.indigoA8,
  supportiveA9: indigoA.indigoA9,
  supportiveA10: indigoA.indigoA10,
  supportiveA11: indigoA.indigoA11,
  supportiveA12: indigoA.indigoA12
}

const error = {
  error1: red.red1,
  error2: red.red2,
  error3: red.red3,
  error4: red.red4,
  error5: red.red5,
  error6: red.red6,
  error7: red.red7,
  error8: red.red8,
  error9: red.red9,
  error10: red.red10,
  error11: red.red11,
  error12: red.red12
}

const errorA = {
  errorA1: redA.redA1,
  errorA2: redA.redA2,
  errorA3: redA.redA3,
  errorA4: redA.redA4,
  errorA5: redA.redA5,
  errorA6: redA.redA6,
  errorA7: redA.redA7,
  errorA8: redA.redA8,
  errorA9: redA.redA9,
  errorA10: redA.redA10,
  errorA11: redA.redA11,
  errorA12: redA.redA12
}

const success = {
  success1: green.green1,
  success2: green.green2,
  success3: green.green3,
  success4: green.green4,
  success5: green.green5,
  success6: green.green6,
  success7: green.green7,
  success8: green.green8,
  success9: green.green9,
  success10: green.green10,
  success11: green.green11,
  success12: green.green12
}

const successA = {
  successA1: greenA.greenA1,
  successA2: greenA.greenA2,
  successA3: greenA.greenA3,
  successA4: greenA.greenA4,
  successA5: greenA.greenA5,
  successA6: greenA.greenA6,
  successA7: greenA.greenA7,
  successA8: greenA.greenA8,
  successA9: greenA.greenA9,
  successA10: greenA.greenA10,
  successA11: greenA.greenA11,
  successA12: greenA.greenA12
}

export const colors = stylex.defineVars({
  ...blackA,
  ...whiteA,

  ...gray,
  ...grayA,

  ...indigo,
  ...indigoA,

  ...blue,
  ...blueA,

  ...red,
  ...redA,

  ...accent,
  ...accentA,

  ...supportive,
  ...supportiveA,

  ...error,
  ...errorA,
  ...success,
  ...successA,

  foreground: gray.gray12
})
