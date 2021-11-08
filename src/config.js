/**
 * content config file
 * with proper config,
 * insert `call with ringcentral` button
 * or hover some elemet show call button tooltip
 * or convert phone number text to click-to-call link
 *
 */

/// *
import {
  sendMsgToRCIframe,
  checkPhoneNumber
} from 'ringcentral-embeddable-extension-common/src/common/helpers'
import { upgrade } from 'ringcentral-embeddable-extension-common/src/feat/upgrade-notification'
//* /

import { syncCallLogToThirdParty } from './feat/call-log-sync'
import {
  getByPage,
  match
} from 'ringcentral-embeddable-extension-common/src/common/db'
import initReact from './lib/react-entry'
import { initReactModule } from './feat/react-entry'
import { resyncCheck } from './lib/auto-resync'

window.is_engage_voice = true

// insert click to call button
export const insertClickToCallButton = [
  /// *
  {
    // must match page url
    shouldAct: href => {
      return /\/person\/\d+/.test(href)
    },

    // define in the page how to get phone number,
    // if can not get phone number, will not insert the call button
    // support async
    getContactPhoneNumbers: async () => {
      const phones = document.querySelectorAll('.viewContainer:not([style*="none"]) [data-test="phone-label"]')
      return Array.from(phones).map((p, i) => {
        const n = p.parentNode.nextSibling || p.nextSibling
        if (!n) {
          return null
        }
        const title = n ? n.textContent.trim() : 'Direct' + i
        const id = title
        const number = p.textContent.trim().replace('*', '#').replace(' ext. ', '#')
        if (checkPhoneNumber(number)) {
          return {
            id,
            title,
            number
          }
        } else {
          return null
        }
      }).filter(d => d)
    },

    // parent dom to insert call button
    // can be multiple condition
    // the first one matches, rest the array will be ignored
    parentsToInsertButton: [
      {
        getElem: () => {
          return document.querySelector('.viewContainer:not([style*="none"]) .detailView.personDetails .infoBlock .spacer')
        },
        insertMethod: 'insertBefore'
      }
    ]
  }
  //* /
]

// hover contact node to show click to dial tooltip
export const hoverShowClickToCallButton = [
  /// *
  // config example
  {
    // must match url
    shouldAct: href => {
      return /\/persons\/list\/user\/(\d+)|everyone/.test(href)
    },

    // elemment selector
    selector: '.gridContent--scrollable .gridContent__table tbody tr',

    // function to get phone numbers, suport async function
    getContactPhoneNumbers: async elem => {
      let phoneNodes = elem.querySelectorAll('td[data-field="phone"]')
      if (!phoneNodes.length) {
        phoneNodes = elem.querySelectorAll('td[data-field="person.phone"]')
      }
      return Array.from(phoneNodes)
        .map((p, i) => {
          const nn = p.querySelector('.gridCell__salesPhoneValue')
          let number = nn ? nn.textContent.trim() : ''
          let title = p.querySelector('.gridCell__valueRemark')
          let title0 = title ? title.textContent : 'Direct'
          title0 = title0.trim()
          title = title0.replace(/\(|\)/g, '')
          title = title.trim()
          number = number.replace(title0, '').replace('*', '#').replace(' ext. ', '#')
          return {
            id: 'p_' + i,
            title,
            number
          }
        }).filter(d => checkPhoneNumber(d.number))
    }
  }
  //* /
]

// modify phone number text to click-to-call link
export const phoneNumberSelectors = [
  /// * example config
  {
    shouldAct: (href) => {
      return /\/person\/\d+/.test(href)
    },
    selector: '.fieldsList [data-test="phone-label"]'
  },
  {
    shouldAct: (href) => {
      return /\/person\/\d+/.test(href)
    },
    selector: '[data-test="activity-note"] b'
  },
  {
    shouldAct: (href) => {
      return /\/deal\/\d+/.test(href)
    },
    selector: '[data-test="activity-note"] b'
  }
  //* /
]

/**
 * thirdPartyService config
 * @param {*} serviceName
 */
export function thirdPartyServiceConfig (serviceName) {
  console.log(serviceName, 'serviceName')

  const services = {
    name: serviceName,
    callLoggerEnabled: true,
    contactMatcherEnabled: true
  }

  // handle ringcentral event
  const handleRCEvents = async e => {
    const { payload = {}, requestId } = e.data || {}
    console.debug('payload', payload, e)
    if (payload.requestType === 'rc-ev-logCall') {
      const { data } = payload
      data.triggerType = 'auto'
      data.description = data.task.notes
      syncCallLogToThirdParty(data)
      sendMsgToRCIframe({
        type: 'MessageTransport-response',
        requestId,
        result: 'ok'
      }, true)
    } else if (payload.requestType === 'rc-ev-matchContacts') {
      const phoneNumbers = payload.data.map(q => q.phoneNumber)
      const res = await match(phoneNumbers)
      sendMsgToRCIframe({
        type: 'MessageTransport-response',
        requestId,
        result: res
      }, true)
    }
  }
  return {
    services,
    handleRCEvents,
    isEngageVoice: true
  }
}

/**
 * init third party
 * could init dom insert etc here
 */
export async function initThirdParty () {
  upgrade()
  initReact()
  initReactModule()
  const db = await getByPage(1, 1)
  resyncCheck(db && db.count)
}
