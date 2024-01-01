// eslint.config.js
import antfu from '@antfu/eslint-config'

export default await antfu({ rules: { 'no-console': 'off', 'node/prefer-global/process': 'off', 'no-unused-vars': 'off', 'ts/no-unused-vars': 'off', 'unused-imports/no-unused-vars': 'off', 'node/prefer-global/buffer': 'off' } })
