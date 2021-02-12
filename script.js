const btnNewTransaction = document.querySelector('.btn-new')
const overlay = document.querySelector('.overlay')

const form = document.getElementById('form')
const btnCancelTransaction = document.querySelector('.form-btn.cancel')
const saveBtn = document.querySelector('.form-btn.save')

const settings_container = document.querySelector('.show-settings')
const settings_button = document.querySelector('.settings-button')
const toggle = document.getElementById('theme-toggle')
const animation_toggle = document.getElementById('animation-toggle')

let month = new Date().getMonth()
const monthDisplay = document.querySelector('.selector-container')

const selector = document.querySelector('.months-selector')
const yearSelector = document.querySelector('.year-selector')

const btnPrev = document.querySelector('.prev')    
const btnNext = document.querySelector('.next')
const btnAll = document.querySelector('.all')

const searchButton = document.querySelector('.search-button')
const searchBar = document.querySelector('.search-bar')

//Settings
settings_button.addEventListener('click', () => {
    settings_container.classList.toggle('active')
})

//Theme toggle 
toggle.addEventListener('click', (evt) => {
    const html = document.querySelector('html')
    if(evt.target.checked === true){
        html.classList.toggle('dark')
    }
    else{
        html.classList.toggle('dark')
    }
}
)

//Animation toggle
let animationsOff = false
animation_toggle.addEventListener('change', (evt) => {
   if(evt.target.checked){
       animationsOff = false
   }
   else{
       animationsOff = true
   }
})

//Search Button and Bar
searchButton.addEventListener('click', () => {
    searchBar.focus()
   if(searchBar.value !== ''){
        Search.searchTransaction()
   }
   else{
        searchBar.classList.toggle('inactive')
    }
})
searchBar.addEventListener('keyup',(evt) => {
    if(evt.keyCode === 13){
        Search.searchTransaction()
    }
    else{
        searchBar.style.border = "none"
    }
})

//Selector initially receives the current month value
selector.value = month

//Changing the month and year by selector
selector.addEventListener('change', (evt)=> {
    if(evt.target.value === "undefined"){
        month = undefined
    }
    else{
        month = Number(evt.target.value)
    }
    App.reload()
})
yearSelector.addEventListener('change', ()=> {
    App.reload()
})


//Changing the month via button
btnPrev.addEventListener('click', () => {
    if(month === undefined){
        month = new Date().getMonth()
    }
    else if( month === 0){
        month = 11
    }
    else{
        month -= 1
    }
    selector.value = month
    Search.resetYear()
    App.reload()
})    
btnNext.addEventListener('click', () => {
    if(month === undefined){
        month = new Date().getMonth()
    }
    else if(month === 11){
        month = 0;
    }
    else{
        month += 1
    }
    selector.value = month
    Search.resetYear()
    App.reload()
})
btnAll.addEventListener('click', () => {
    month = undefined;
    yearSelector.value = "undefined"
    selector.value = month

    App.reload()
})

const Search = {
    searchTransaction(){
        let search = searchBar.value
        const regExp = new RegExp(search, 'gi')

        let searchedResult = Transaction.all.filter(transaction => {
            return regExp.test(transaction.description) === true
        })

        if(searchedResult.length > 0){
            searchBar.value = ''
            searchBar.classList.toggle('inactive')

            selector.value = 'pesquisa'
            yearSelector.value = 'pesquisa'

            DOM.clearTransactions()
            Search.calcSpecificTransaction(searchedResult)
            for(let i = 0; i < searchedResult.length; i+= 1){
                DOM.addTransactions(searchedResult[i])
            }
        }
        else{
            searchBar.style.border = "4px solid red"
        }
    },

    calcSpecificTransaction(searchedResult){
        let income = 0
        let expense = 0
        searchedResult.forEach(result => {
            if(result.type === 'EXPENSE'){
                expense += result.amount
            }
            else if(result.type === 'INCOME'){
                income += result.amount
            }
            else{
                console.log("Something unexpected happened")
            }
        })
        let result = income - expense
    
        const total = document.querySelector('.card.result-card')
        document.querySelector('.money.input').innerHTML = Utils.formatCurrency(income, 'INCOME')
        document.querySelector('.money.output').innerHTML = Utils.formatCurrency(expense, 'EXPENSES')
        result < 0 ? total.classList.add('negative') : total.classList.remove('negative')
        document.querySelector('.money.result').innerHTML = Utils.formatCurrency(result, 'INCOME')
    },

    resetYear(){
        if(yearSelector.value === 'pesquisa'){
            let year = 1900 + new Date().getYear()
            yearSelector.value = year
        }
    }
}

const Modal = {
    open(){
        overlay.classList.add('active')
        form.classList.toggle('active')
    },
    close(){
        overlay.classList.remove('active')
        form.classList.remove('active')
    }
}

const Utils = {
    formatCurrency(amount, type){
        const transactionSymbol = type === "INCOME" ? "" : "-"

        amount = Number(amount) / 100
        amount = amount.toLocaleString('pt-br', {
            style: 'currency',
            currency: 'BRL',
        })
    
        return (transactionSymbol + amount)
    },

    formatAmount(value){
        value = Number(value) * 100        
        return Math.round(value)
    },

    formatDate(date){
        const splittedDate = date.split('-')
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },
    formatType(type){
        return type === "0" ? "INCOME" : "EXPENSE"
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),
    add(transactions){
        Transaction.all.push(transactions)
        App.reload()
    },
    remove(index){
        Transaction.all.splice(index, 1)
        App.reload()
    },

    incomes(){
        let income = 0     

        income = Transaction.calc(income, 'INCOME')

        return income
    },

    expenses(){
        let expense = 0
        
        expense = Transaction.calc(expense, 'EXPENSE')

        return expense
    },

    total(){
        let total = Transaction.incomes() - Transaction.expenses()
        return total
    },

    undefinedMonth(value, type){
        Transaction.all.forEach(transaction => {
            if(transaction.type === type){
                value += Number(transaction.amount)
            }
        })
    },

    calc(value, type){
        let selectedYear = yearSelector.value

        if(selectedYear === "undefined"){
          if(month === undefined){
            this.undefinedMonth(value, type)
          }
          else{
              Transaction.all.forEach(transaction => {
                  let date  = transaction.date.split("/")
                  if(Number(date[1]) === month + 1 && transaction.type === type){
                      value += Number(transaction.amount)
                  }
              })    
          }
        }
        else if(Number(selectedYear) >= 2012 && Number(selectedYear) <= 2021){
          if(month === undefined){
            this.undefinedMonth(value, type)
          }
          else{
              Transaction.all.forEach(transaction => {
                  let date  = transaction.date.split("/")
                  if(Number(date[1]) === month + 1 && transaction.type === type && date[2] === selectedYear){
                      value += Number(transaction.amount)
                  }
              })    
          }
        }
        return value;
    }
}

const DOM = {
    transactionsContainer: document.getElementById('tbody'),

    innerHTMLTransaction(transactions, index) {
        const {description, amount, type, date} = transactions

        const CSSclass = type === "INCOME" ? "positive" : "negative"
        const formatedAmount = Utils.formatCurrency(amount, type)

        const html = `
                <td class="td description">${description}</td>
                <td class="td ${CSSclass}">${formatedAmount}</td>
                <td class="td date">${date}</td>
                <td class="td"><button id="${index}"class="btn-td"><img src="./assets/minus.svg" alt="Remover Transação"></button></td>
        `
        return html
    },

    addTransactions(transactions, index) {
        const tr = document.createElement('tr')
        tr.classList.add('tr')
        tr.dataset.index = index
        tr.innerHTML = DOM.innerHTMLTransaction(transactions, index)
        DOM.transactionsContainer.appendChild(tr)
    },

    updateBalance(){
        const total = document.querySelector('.card.result-card')
        document.querySelector('.money.input').innerHTML = Utils.formatCurrency(Transaction.incomes(), 'INCOME')
        document.querySelector('.money.output').innerHTML = Utils.formatCurrency(Transaction.expenses(), 'EXPENSES')
        Transaction.total() < 0 ? total.classList.add('negative') : total.classList.remove('negative')
        document.querySelector('.money.result').innerHTML = Utils.formatCurrency(Transaction.total(), 'INCOME')
    },

    clearTransactions(){
        DOM.transactionsContainer.innerHTML = ''
    }
}

const Form = {
    description: document.getElementById('input-description'),
    amount: document.getElementById('input-value'),
    date: document.getElementById('input-date'),
    type: document.getElementById('select'),

    getValues() {
        return{
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
            type: Form.type.value,
        }
    },

    validateField(){
        const {description, amount, date, type } = Form.getValues()
        if(description.trim() === '' || amount.trim() === '' || date.trim() === '' || type.trim() === ''){
            throw new Error("Por favor preencha todos os campos!")
        }
    },

    formatData(){
        let {description, amount, date, type } = Form.getValues()

        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)
        type = Utils.formatType(type)

        return {
            description,
            amount,
            date,
            type
        }
    },

    saveTransaction(transaction){
        Transaction.add(transaction)
    },

    clearFields(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
        Form.type.value = ""
    },

    submit(data){
        try{
            Form.validateField()
            const transaction = Form.formatData()
            Form.saveTransaction(transaction)
            Form.clearFields()
            Modal.close()
        }
        catch(error){
            alert(error.message)
        }
    }
}

const Animations = {
    animationHeight(initialHeight, finalHeight, delay ){
        let anima = document.querySelector('.animation-div')

        console.log(finalHeight)
        anima.animate([
            {height: `${initialHeight}px`},
            {height: `${finalHeight * 60}px`}
        ], {
            delay: delay,
            duration: 400,
        })
    },

    animationClose(){
        let anima = document.querySelector('.animation-div')
        Animations.animationHeight(anima.offsetHeight, 0 , 0)
    },

    animationOpen(){
        let selectedYear = yearSelector.value
    
        let transactionMonths = []
        let transactionMonthAndYear = []

        Transaction.all.forEach(transaction => {
            const dates = transaction.date.split('/')
            transactionMonths.push(dates[1])
            transactionMonthAndYear.push(`${dates[1]}/${dates[2]}`)
        })
    
        if(month === undefined){
            let length = transactionMonths.length
            //Adding the thead height
            length += 1
            Animations.animationHeight(0, length , 400)
        }
        else{
            let animationHeight = 1
    
            transactionMonths.forEach(transaction => {
                //Add to the animationHeight the number of transactions that match the selected date
                if(Number(transaction) === month + 1){
                    animationHeight+= 1
                }
            })

           transactionMonthAndYear.forEach(transaction => {
             let array = transaction.split('/')
             let thisYear = array[1]
             let thisMonth = Number(array[0])
             if(selectedYear === 'undefined'){
                 //console.log('Do nothing, to not bug the animation')
             }
             //Subtract from the animationHeight the number of transactions that do not match the date selection
             else if(selectedYear !== thisYear && thisMonth === month + 1){
               animationHeight-= 1
             }
           })
    
           
            Animations.animationHeight(0, animationHeight , 400)
        }
    }
}

const App = {
    init() {
    Transaction.all.forEach((transaction, index) => {
        let date  = transaction.date.split("/")
        let year = yearSelector.value

        //If year is undefined it shows results of all years
        //If month is undefined it show results of all months
        if(year === "undefined"){
            if(month === undefined){
                DOM.addTransactions(transaction, index)
            }
            else if(Number(date[1]) === month + 1){         
                DOM.addTransactions(transaction, index)
            }
        }
        else if(date[2] === year){
            if(month === undefined){
                DOM.addTransactions(transaction, index)
            }
            else if(Number(date[1]) === month + 1){         
                DOM.addTransactions(transaction, index)
            }
        }
    })

    //Remove Transaction
    const removeBtns = document.querySelectorAll('.btn-td')
    removeBtns.forEach( (btn, idx) => {
        btn.addEventListener('click', () => {
            Transaction.remove(idx)
        })
    }
    )

    DOM.updateBalance()

    Storage.set(Transaction.all)

    },
    reload() {
        if(animationsOff === false){
            Animations.animationClose()
            Animations.animationOpen()
        }
        DOM.clearTransactions()
        App.init()
    },
}

App.init()

btnNewTransaction.addEventListener('click', () => {
    Modal.open()
})

btnCancelTransaction.addEventListener('click', (evt) => {
    evt.preventDefault()
    Modal.close()
})

//Save Transaction
saveBtn.addEventListener("click", (evt) => {
    evt.preventDefault()
    Form.submit()
})
