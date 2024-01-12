let elementMap = {};
let requestTypes = ['get', 'post', 'put', 'delete', 'patch'];
let swapMode = ['innerHTML', 'outerHTML', 'beforebegin', 'afterbegin', 'beforeend', 'afterend', 'none'];

document.addEventListener('DOMContentLoaded', () => {
    let elements = document.querySelectorAll('[data-hxm-req]');
    for (let i = 0; i < elements.length; i++) {
        let element = elements[i];

        let type = element.getAttribute('data-hxm-req');
        if (!requestTypes.includes(type)) {
            throw new Error(`Invalid request type: ${type}. It has to be one of ${requestTypes.join(', ')}`);
        }

        // Main attributes
        let url = element.getAttribute('data-hxm-url');
        let trigger = element.getAttribute('data-hxm-trigger');
        let target = element.getAttribute('data-hxm-target');
        let swap = element.getAttribute('data-hxm-swap');

        // Modifiers
        let delay = element.getAttribute('data-hxm-delay');

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

        let targets = [element];
        if (target) {
            targets = document.querySelectorAll(target);
        }

        if (!swap) {
            swap = 'innerHTML';
        }

        if (!swapMode.includes(swap)) {
            throw new Error(`Invalid swap mode: ${swap}. It has to be one of ${swapMode.join(', ')}`);
        }

        elementMap[element] = { url, type, trigger, targets, swap, delay };
        element.addEventListener(trigger, (event) => {
            event.preventDefault();

            const el = elementMap[event.currentTarget];

            let xhr = new XMLHttpRequest();
            xhr.open(el.type, el.url, true);
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    try {
                        let response = xhr.responseText;
                        if (response == '' || el.swap == 'none') {
                            return;
                        }

                        let targets = el.targets;
                        let adjacent = (el.swap != "innerHTML" && el.swap != "outerHTML");
                        for (let i = 0; i < targets.length; i++) {
                            if (adjadenct) {
                                targets[i].insertAdjacentHTML(el.swap, response);
                            } else {
                                targets[i][el.swap] = response;
                            }
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }
            }

            let data = {};
            if (event.currentTarget.tagName.toLowerCase() === 'form') {
                data = new FormData(event.currentTarget);
            }
            
            if (el.delay) {
                setTimeout(() => {
                    xhr.send(data);
                }, el.delay);
                return;
            }
            
            xhr.send(data);
        })
    }
});