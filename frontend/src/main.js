import { createApp } from 'vue'
import { loader } from '@guolao/vue-monaco-editor'
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import './style.css'
import App from './App.vue'

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
	window.addEventListener('load', async () => {
		try {
			const registrations = await navigator.serviceWorker.getRegistrations()
			await Promise.all(registrations.map((registration) => registration.unregister()))
		} catch (error) {
			console.warn('No se pudieron limpiar los Service Workers antiguos', error)
		}
	})
}

self.MonacoEnvironment = {
	getWorker(_, label) {
		if (label === 'json') return new jsonWorker()
		if (label === 'css' || label === 'scss' || label === 'less') return new cssWorker()
		if (label === 'html' || label === 'handlebars' || label === 'razor') return new htmlWorker()
		if (label === 'typescript' || label === 'javascript') return new tsWorker()
		return new editorWorker()
	}
}

monaco.languages.html.htmlDefaults.setOptions({
	format: {
		wrapLineLength: 120,
		unformatted: 'wbr'
	},
	suggest: {
		html5: true
	},
	completion: {
		attributeDefaultValue: 'doublequotes'
	}
})

monaco.languages.registerCompletionItemProvider('html', {
	triggerCharacters: ['<', ' ', '/', '"'],
	provideCompletionItems(model, position) {
		const word = model.getWordUntilPosition(position)
		const range = {
			startLineNumber: position.lineNumber,
			endLineNumber: position.lineNumber,
			startColumn: word.startColumn,
			endColumn: word.endColumn
		}

		const suggestions = [
			{
				label: 'html:5',
				kind: monaco.languages.CompletionItemKind.Snippet,
				insertText: '<!DOCTYPE html>\n<html lang="es">\n<head>\n\t<meta charset="UTF-8" />\n\t<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n\t<title>${1:Mi página}</title>\n</head>\n<body>\n\t${2}\n</body>\n</html>',
				insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
				detail: 'Plantilla HTML5 completa',
				range
			},
			{
				label: 'hgroup',
				kind: monaco.languages.CompletionItemKind.Snippet,
				insertText: '<h1>${1:Título principal}</h1>\n<h2>${2:Subtítulo}</h2>\n<h3>${3:Detalle}</h3>',
				insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
				detail: 'Encabezados h1-h3',
				range
			},
			{
				label: 'a:blank',
				kind: monaco.languages.CompletionItemKind.Snippet,
				insertText: '<a href="${1:https://example.com}" target="_blank" rel="noopener noreferrer">${2:Enlace}</a>',
				insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
				detail: 'Enlace externo seguro',
				range
			},
			{
				label: 'table:basic',
				kind: monaco.languages.CompletionItemKind.Snippet,
				insertText: '<table>\n\t<tr>\n\t\t<th>${1:Nombre}</th>\n\t\t<th>${2:Edad}</th>\n\t</tr>\n\t<tr>\n\t\t<td>${3:Ana}</td>\n\t\t<td>${4:22}</td>\n\t</tr>\n</table>',
				insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
				detail: 'Tabla básica',
				range
			},
			{
				label: 'form:basic',
				kind: monaco.languages.CompletionItemKind.Snippet,
				insertText: '<form>\n\t<label for="${1:email}">${2:Correo}</label>\n\t<input id="${1:email}" type="email" required />\n\t<button type="submit">${3:Enviar}</button>\n</form>',
				insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
				detail: 'Formulario básico HTML5',
				range
			}
		]

		return { suggestions }
	}
})

loader.config({ monaco })

createApp(App).mount('#app')
