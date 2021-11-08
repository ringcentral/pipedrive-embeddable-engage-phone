
/**
 * content.js for chrome extension
 */

import createApp from 'ringcentral-embeddable-extension-common/src/spa/init'
import * as config from './config'
import { ringCentralConfigs, thirdPartyConfigs, appVersion } from 'ringcentral-embeddable-extension-common/src/common/app-config'
import 'ringcentral-embeddable-extension-common/src/spa/style.styl'
import './custom.styl'

const {
  clientID,
  appServer,
  clientSecret
} = ringCentralConfigs

let appConfigQuery = ''
const { serviceName } = thirdPartyConfigs
if (clientID || appServer) {
  appConfigQuery = `?zIndex=9999&prefix=${serviceName}-rc&userAgent=${serviceName}_extension%2F${appVersion}&appKey=${clientID}&appSecret=${clientSecret}&appServer=${encodeURIComponent(appServer)}`
}

/* eslint-disable-next-line */
;(function() {
  console.log('import RingCentral Embeddable Engage Voice to web page')
  const rcs = document.createElement('script')
  rcs.src = 'https://ringcentral.github.io/engage-voice-embeddable/adapter.js' + appConfigQuery
  const rcs0 = document.getElementsByTagName('script')[0]
  rcs0.parentNode.insertBefore(rcs, rcs0)
})()

window.addEventListener('load', createApp(config))
