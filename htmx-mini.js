let elementMap = {};
let requestTypes = ['get', 'post', 'put', 'delete', 'patch'];
let swapMode = ['innerHTML', 'outerHTML', 'beforebegin', 'afterbegin', 'beforeend', 'afterend', 'delete', 'none'];

document.addEventListener('DOMContentLoaded', () => {
    let elements = document.querySelectorAll('[data-hxm-req]');
    for (let i = 0; i < elements.length; i++) {
        let element = elements[i];

        let type = element.getAttribute('data-hxm-req');
        if (!requestTypes.includes(type.toLowerCase())) {
            throw new Error(`Invalid request type: ${type}. It has to be one of ${requestTypes.join(', ')}`);
        }

        let url = element.getAttribute('data-hxm-url');
        let trigger = element.getAttribute('data-hxm-trigger');
        let target = element.getAttribute('data-hxm-target');
        let swap = element.getAttribute('data-hxm-swap');

        if (!url) {
            url = window.location.href;
        }

        if (!trigger) {
            switch (element.tagName.toLowerCase()) {
                case 'input':
                case 'textarea':
                case 'select':
                    trigger = 'change';
                    break;
                case 'form':
                    trigger = 'submit';
                    break;
                default:
                    trigger = 'click';
            }
        }

        if (!swap) {
            swap = 'innerHTML';
        }

        if (!swapMode.includes(swap)) {
            throw new Error(`Invalid swap mode: ${swap}. It has to be one of ${swapMode.join(', ')}`);
        }

        elementMap[element] = { url, type, target, swap };
        element.addEventListener(trigger, (event) => {
            event.preventDefault();

            const el = elementMap[event.target];

            let xhr = new XMLHttpRequest();
            xhr.open(el.type, el.url, true);
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    if (el.swap == 'none') { return; }

                    let response = xhr.responseText;
                    let targets = el.target ? document.querySelectorAll(el.target) : [event.target];
                    let adjacent = (el.swap != 'innerHTML' && el.swap != 'outerHTML');
                    for (let i = 0; i < targets.length; i++) {
                        if (el.swap == 'delete') {
                            targets[i].parentNode.removeChild(targets[i]);
                            continue;
                        }

                        if (adjacent) {
                            targets[i].insertAdjacentHTML(el.swap, response);
                        } else {
                            targets[i][el.swap] = response;
                        }
                    }
                }
            }

            let data = {};
            if (event.currentTarget.tagName.toLowerCase() === 'form') {
                data = new FormData(event.currentTarget);
            }

            xhr.send(data);
        })
    }
});