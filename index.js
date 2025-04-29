document.addEventListener("DOMContentLoaded", () => {
  const display = document.getElementById("display")
  const expressionDisplay = document.getElementById("expression")
  const keys = document.querySelector(".calculator-keys")
  const historyList = document.getElementById("history-list")
  const clearHistoryBtn = document.getElementById("clear-history")

  let displayValue = "0"
  let firstOperand = null
  let waitingForSecondOperand = false
  let operator = null
  let expressionValue = ""
  let calculationHistory = []

  // Load history from localStorage if available
  function loadHistory() {
    const savedHistory = localStorage.getItem("calculatorHistory")
    if (savedHistory) {
      calculationHistory = JSON.parse(savedHistory)
      updateHistoryDisplay()
    }
  }

  // Save history to localStorage
  function saveHistory() {
    localStorage.setItem("calculatorHistory", JSON.stringify(calculationHistory))
  }

  // Update the display
  function updateDisplay() {
    display.value = displayValue

    // Update expression display
    if (operator && firstOperand !== null) {
      const operatorSymbol = getOperatorSymbol(operator)
      if (waitingForSecondOperand) {
        expressionValue = `${firstOperand} ${operatorSymbol}`
      } else {
        expressionValue = `${firstOperand} ${operatorSymbol} ${displayValue}`
      }
    } else if (firstOperand !== null && waitingForSecondOperand) {
      expressionValue = `${firstOperand} =`
    } else {
      expressionValue = displayValue
    }

    expressionDisplay.textContent = expressionValue
  }

  // Get operator symbol for display
  function getOperatorSymbol(op) {
    switch (op) {
      case "add":
        return "+"
      case "subtract":
        return "-"
      case "multiply":
        return "×"
      case "divide":
        return "÷"
      default:
        return ""
    }
  }

  // Handle digit input
  function inputDigit(digit) {
    if (waitingForSecondOperand) {
      displayValue = digit
      waitingForSecondOperand = false
    } else {
      displayValue = displayValue === "0" ? digit : displayValue + digit
    }
  }

  // Handle decimal point
  function inputDecimal() {
    if (waitingForSecondOperand) {
      displayValue = "0."
      waitingForSecondOperand = false
      return
    }

    if (!displayValue.includes(".")) {
      displayValue += "."
    }
  }

  // Handle operators
  function handleOperator(nextOperator) {
    const inputValue = Number.parseFloat(displayValue)

    if (operator && waitingForSecondOperand) {
      operator = nextOperator
      updateDisplay()
      return
    }

    if (firstOperand === null) {
      firstOperand = inputValue
    } else if (operator) {
      const result = calculate(firstOperand, inputValue, operator)

      // Add to history
      const operatorSymbol = getOperatorSymbol(operator)
      const historyEntry = {
        expression: `${firstOperand} ${operatorSymbol} ${inputValue}`,
        result: result,
      }
      addToHistory(historyEntry)

      displayValue = `${Number.parseFloat(result.toFixed(7))}`
      firstOperand = result
    }

    waitingForSecondOperand = true
    operator = nextOperator
  }

  // Perform calculation
  function calculate(firstOperand, secondOperand, operator) {
    switch (operator) {
      case "add":
        return firstOperand + secondOperand
      case "subtract":
        return firstOperand - secondOperand
      case "multiply":
        return firstOperand * secondOperand
      case "divide":
        return firstOperand / secondOperand
      default:
        return secondOperand
    }
  }

  // Reset calculator
  function resetCalculator() {
    displayValue = "0"
    firstOperand = null
    waitingForSecondOperand = false
    operator = null
    expressionValue = ""
  }

  // Handle percentage
  function handlePercentage() {
    const currentValue = Number.parseFloat(displayValue)
    if (!isNaN(currentValue)) {
      displayValue = (currentValue / 100).toString()
    }
  }

  // Toggle sign
  function toggleSign() {
    const currentValue = Number.parseFloat(displayValue)
    if (!isNaN(currentValue)) {
      displayValue = (currentValue * -1).toString()
    }
  }

  // Add entry to history
  function addToHistory(entry) {
    calculationHistory.unshift(entry) // Add to beginning of array

    // Limit history to 10 items
    if (calculationHistory.length > 10) {
      calculationHistory.pop()
    }

    updateHistoryDisplay()
    saveHistory()
  }

  // Update history display
  function updateHistoryDisplay() {
    historyList.innerHTML = ""

    if (calculationHistory.length === 0) {
      const emptyMessage = document.createElement("div")
      emptyMessage.className = "history-item"
      emptyMessage.textContent = "No history yet"
      historyList.appendChild(emptyMessage)
      return
    }

    calculationHistory.forEach((entry) => {
      const historyItem = document.createElement("div")
      historyItem.className = "history-item"

      const expressionElement = document.createElement("div")
      expressionElement.className = "history-expression"
      expressionElement.textContent = entry.expression

      const resultElement = document.createElement("div")
      resultElement.className = "history-result"
      resultElement.textContent = `= ${entry.result}`

      historyItem.appendChild(expressionElement)
      historyItem.appendChild(resultElement)

      // Add click event to reuse the result
      historyItem.addEventListener("click", () => {
        displayValue = entry.result.toString()
        firstOperand = null
        waitingForSecondOperand = false
        operator = null
        updateDisplay()
      })

      historyList.appendChild(historyItem)
    })
  }

  // Clear history
  function clearHistory() {
    calculationHistory = []
    updateHistoryDisplay()
    localStorage.removeItem("calculatorHistory")
  }

  // Event listener for button clicks
  keys.addEventListener("click", (event) => {
    const { target } = event

    if (!target.matches("button")) {
      return
    }

    if (target.classList.contains("key-operator")) {
      handleOperator(target.dataset.action)
      updateDisplay()
      return
    }

    if (target.classList.contains("key-equals")) {
      if (operator && !waitingForSecondOperand) {
        const secondOperand = Number.parseFloat(displayValue)
        const result = calculate(firstOperand, secondOperand, operator)

        // Add to history
        const operatorSymbol = getOperatorSymbol(operator)
        const historyEntry = {
          expression: `${firstOperand} ${operatorSymbol} ${secondOperand}`,
          result: result,
        }
        addToHistory(historyEntry)

        displayValue = `${Number.parseFloat(result.toFixed(7))}`
        firstOperand = result
        operator = null
        waitingForSecondOperand = true
      }
      updateDisplay()
      return
    }

    if (target.classList.contains("key-clear")) {
      resetCalculator()
      updateDisplay()
      return
    }

    if (target.classList.contains("key-sign")) {
      toggleSign()
      updateDisplay()
      return
    }

    if (target.classList.contains("key-percent")) {
      handlePercentage()
      updateDisplay()
      return
    }

    if (target.classList.contains("key-decimal")) {
      inputDecimal()
      updateDisplay()
      return
    }

    inputDigit(target.textContent)
    updateDisplay()
  })

  // Event listener for clear history button
  clearHistoryBtn.addEventListener("click", clearHistory)

  // Initialize display and history
  loadHistory()
  updateDisplay()
})
