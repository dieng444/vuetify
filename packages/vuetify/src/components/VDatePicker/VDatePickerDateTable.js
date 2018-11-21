// Mixins
import Colorable from '../../mixins/colorable'
import DatePickerTable from './mixins/date-picker-table'
import Themeable from '../../mixins/themeable'

// Utils
import { pad, createNativeLocaleFormatter, monthChange } from './util'
import { createRange } from '../../util/helpers'

/* @vue/component */
export default {
  name: 'v-date-picker-date-table',

  mixins: [
    Colorable,
    DatePickerTable,
    Themeable
  ],

  props: {
    firstDayOfWeek: {
      type: [String, Number],
      default: 0
    },
    showWeek: Boolean,
    weekdayFormat: {
      type: Function,
      default: null
    }
  },

  computed: {
    formatter () {
      return this.format || createNativeLocaleFormatter(this.locale, { day: 'numeric', timeZone: 'UTC' }, { start: 8, length: 2 })
    },
    weekdayFormatter () {
      return this.weekdayFormat || createNativeLocaleFormatter(this.locale, { weekday: 'narrow', timeZone: 'UTC' })
    },
    weekDays () {
      const first = parseInt(this.firstDayOfWeek, 10)

      return this.weekdayFormatter
        ? createRange(7).map(i => this.weekdayFormatter(`2017-01-${first + i + 15}`)) // 2017-01-15 is Sunday
        : createRange(7).map(i => ['S', 'M', 'T', 'W', 'T', 'F', 'S'][(i + first) % 7])
    }
  },

  methods: {
    calculateTableDate (delta) {
      return monthChange(this.tableDate, Math.sign(delta || 1))
    },
    genTHead () {
      const days = this.weekDays.map(day => this.$createElement('th', day))
      if (this.showWeek) {
        days.unshift(this.$createElement('th', ''))
      }
      return this.$createElement('thead', this.genTR(days))
    },
    // Returns number of the days from the firstDayOfWeek to the first day of the current month
    weekDaysBeforeFirstDayOfTheMonth () {
      const firstDayOfTheMonth = new Date(`${this.displayedYear}-${pad(this.displayedMonth + 1)}-01T00:00:00+00:00`)
      const weekDay = firstDayOfTheMonth.getUTCDay()
      return (weekDay - parseInt(this.firstDayOfWeek) + 7) % 7
    },
    getWeekNumber () {
      const isLeapYear = ((this.displayedYear % 4 === 0) && (this.displayedYear % 100 !== 0)) || (this.displayedYear % 400 === 0)
      const daysInMonth = [31, isLeapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
      const dayOfYear = daysInMonth.slice(0, this.displayedMonth).reduce((carry, item) => carry + item, 0) // Starts from 0
      const offset = (
        (this.displayedYear + Math.floor((this.displayedYear - 1) / 4)) -
        Math.floor((this.displayedYear - 1) / 100) +
        Math.floor((this.displayedYear - 1) / 400) -
        this.firstDayOfWeek
      ) % 7 // https://en.wikipedia.org/wiki/Zeller%27s_congruence
      return Math.floor((dayOfYear + offset) / 7) + 1
    },
    genTBody () {
      const children = []
      const daysInMonth = new Date(this.displayedYear, this.displayedMonth + 1, 0).getDate()
      let rows = []
      let day = this.weekDaysBeforeFirstDayOfTheMonth()
      let weekNumber = this.getWeekNumber()

      if (this.showWeek) {
        rows.push(this.$createElement('td', [
          this.$createElement('small', {
            staticClass: 'v-date-picker-table--date__week'
          }, String(weekNumber++).padStart(2, '0'))
        ]))
      }

      while (day--) rows.push(this.$createElement('td'))
      for (day = 1; day <= daysInMonth; day++) {
        const date = `${this.displayedYear}-${pad(this.displayedMonth + 1)}-${pad(day)}`

        rows.push(this.$createElement('td', [
          this.genButton(date, true)
        ]))

        if (rows.length % (this.showWeek ? 8 : 7) === 0) {
          children.push(this.genTR(rows))
          rows = []
          if (day < daysInMonth && this.showWeek) {
            rows.push(this.$createElement('td', [
              this.$createElement('small', {
                staticClass: 'v-date-picker-table--date__week'
              }, String(weekNumber++).padStart(2, '0'))
            ]))
          }
        }
      }

      if (rows.length) {
        children.push(this.genTR(rows))
      }

      return this.$createElement('tbody', children)
    },
    genTR (children) {
      return [this.$createElement('tr', children)]
    }
  },

  render () {
    return this.genTable('v-date-picker-table v-date-picker-table--date', [
      this.genTHead(),
      this.genTBody()
    ])
  }
}
