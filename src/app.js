import Worker from './main.worker'
import virtualize from 'vdom-virtualize'
import toJson from 'vdom-as-json/toJson'
import applyPatch from 'vdom-serialized-patch/patch'
import { getLocalPathname } from 'local-links'

const worker = new Worker()
const rootNode = document.body.firstChild

const { history, location, requestAnimationFrame } = window

worker.onmessage = ({data}) => {
  const { url, payload } = data
  requestAnimationFrame(() => {
    applyPatch(document.body.firstChild, payload)
  })
  if (location.pathname !== url) {
    history.pushState(null, null, url)
  }
}

window.addEventListener('popstate', () => {
  worker.postMessage({type: 'setUrl', payload: location.pathname})
})

document.body.addEventListener('click', (event) => {
  const pathname = getLocalPathname(event)
  if (pathname) {
    event.preventDefault()
    worker.postMessage({type: 'setUrl', payload: pathname})
  }
})

worker.postMessage({type: 'start', payload: {
  tree: toJson(virtualize(rootNode)),
  url: location.pathname
}})