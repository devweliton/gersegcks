// JS/expando.js
document.addEventListener('DOMContentLoaded', () => {
  const DURATION = 300; // ms
  const EASE = 'ease';

  document.querySelectorAll('li.expandable > details').forEach(details => {
    const body = details.querySelector('.details-body');
    if (!body) return;

    const setCollapsed = () => {
      body.style.overflow = 'hidden';
      body.style.maxHeight = '0px';
      body.style.opacity = '0';
    };

    const setExpandedStatic = () => {
      // estado estático aberto (sem limite)
      body.style.overflow = 'visible';
      body.style.maxHeight = 'none';
      body.style.opacity = '1';
    };

    // Estado inicial coerente com o atributo [open]
    if (details.open) {
      // aplica altura real e depois libera
      body.style.maxHeight = body.scrollHeight + 'px';
      body.style.opacity = '1';
      // pequena espera para garantir cálculo antes de liberar
      requestAnimationFrame(() => setExpandedStatic());
    } else {
      setCollapsed();
    }

    // Anima de/para a altura desejada
    const animateTo = (open) => {
      // Captura a altura atual (mesmo se maxHeight for 'none')
      const startHeight = body.getBoundingClientRect().height;

      // Prepara para animar a partir do tamanho atual
      body.style.transition = 'none';
      body.style.overflow = 'hidden';
      body.style.maxHeight = `${startHeight}px`;

      // Força reflow para que a transição seja aplicada corretamente
      // eslint-disable-next-line no-unused-expressions
      body.offsetHeight;

      // Define destino
      const endHeight = open ? body.scrollHeight : 0;

      // Aplica transição e vai para o destino
      body.style.transition = `max-height ${DURATION}ms ${EASE}, opacity 200ms ${EASE}`;
      if (open) {
        body.style.opacity = '1';
        body.style.maxHeight = `${endHeight}px`;
      } else {
        body.style.opacity = '0';
        body.style.maxHeight = '0px';
      }

      const onEnd = (ev) => {
        if (ev.propertyName !== 'max-height') return;

        // Limpa transição e ajusta estado final
        body.style.transition = 'none';
        if (open) {
          setExpandedStatic(); // solta o limite após abrir
        } else {
          setCollapsed();
        }
        body.removeEventListener('transitionend', onEnd);
      };
      body.addEventListener('transitionend', onEnd);
    };

    // Dispara quando o usuário abre/fecha o <details>
    details.addEventListener('toggle', () => {
      animateTo(details.open);
    });

    // Se o conteúdo interno mudar de tamanho enquanto aberto,
    // mantemos a altura coerente (sem "quebrar" a transição)
    const ro = new ResizeObserver(() => {
      if (!details.open) return;

      // Se ainda estivermos em transição (max-height com px),
      // ajuste o destino em tempo real.
      const mh = body.style.maxHeight;
      if (mh && mh !== 'none') {
        body.style.maxHeight = `${body.scrollHeight}px`;
      }
      // Se está estático (max-height: none), não precisa fazer nada;
      // o container já cresce naturalmente.
    });
    ro.observe(body);
  });
});