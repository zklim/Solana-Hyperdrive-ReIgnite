import {
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
  } from '@chakra-ui/react'
import React from 'react'

const NumberInputs = () => {
    const format = (val: any) => `$` + val
    const parse = (val: any) => val.replace(/^\$/, '')
  
    const [value, setValue] = React.useState('1.53')
  
    return (
      <NumberInput
        onChange={(valueString) => setValue(parse(valueString))}
        value={format(value)}
        defaultValue={50}
        min={50}
      >
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
    )
  }

export default NumberInputs