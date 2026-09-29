// Language: English or Spanish, picked from the device and overridable.
//
// Everything the app says lives here. The two dictionaries must hold the same
// keys — a test fails if they drift — so a string can never exist in one
// language only.

export const LANGUAGES = ['en', 'es']
const STORAGE_KEY = 'hearth.lang'
const DEFAULT = 'en'

const EN = {
  'common.cancel': 'Cancel',
  'common.close': 'Close',
  'common.save': 'Save',
  'common.done': 'Done',
  'common.undo': 'Undo',
  'common.today': 'Today',
  'common.yesterday': 'Yesterday',
  'common.grams': '{n} g',

  'tab.fasting': 'Fasting',
  'tab.calories': 'Calories',
  'tab.protein': 'Protein',

  'greeting.morning': 'Good morning',
  'greeting.afternoon': 'Good afternoon',
  'greeting.evening': 'Good evening',
  'greeting.night': 'Good night',

  'storage.blocked': "This browser isn't letting Hearth save. Your logs will disappear when you close it.",
  'storage.refused': "This browser isn't letting Hearth save.",

  'duration.hoursMinutes': '{h}h {m}m',
  'duration.hours': '{h}h',
  'duration.minutes': '{m}m',

  'fast.hoursFasted': 'hours fasted',
  'fast.idleTitle': 'Ready when you are',
  'fast.idleHint': 'Tap “I ate” after your last meal.',
  'fast.ate': 'I ate',
  'fast.aria': '{duration} fasted',
  'fast.stage0': 'Freshly fed. Enjoy the warmth.',
  'fast.stage1': 'Settling in nicely.',
  'fast.stage2': 'Steady and calm.',
  'fast.stage3': 'Almost there. Keep it cozy.',
  'fast.stage4': 'Goal reached. Beautifully done.',
  'fast.lastMeal': 'Last meal · {day} at {time}',
  'fast.goalChip': 'Goal {hours}h',
  'fast.goalToGo': '{goal} · {left} to go',
  'fast.goalReached': '{goal} · reached, +{over}',
  'fast.statLongest': 'Longest fast',
  'fast.statAverage': '7-day average',
  'fast.statCount': 'Meals logged',
  'fast.historyTitle': 'Recent meals',
  'fast.historyEmpty': 'Nothing logged yet. Your meals will gather here.',
  'fast.showOlder': 'Show older meals',
  'fast.firstMeal': 'First meal logged',
  'fast.afterFast': 'after a {duration} fast',
  'fast.deleteMeal': 'Delete meal from {day} at {time}',
  'fast.alreadyLogged': 'Already logged. Enjoy your meal.',
  'fast.loggedFirst': 'Logged at {time}. The clock is running.',
  'fast.loggedAfter': 'Logged at {time} after a {duration} fast.',
  'fast.removed': 'Removed the {time} meal.',
  'fast.forgot': 'Forgot to tap? Log an earlier meal',

  'earlier.title': 'When did you eat?',
  'earlier.hint': 'Log a meal you forgot to tap. The clock picks up from your latest meal.',
  'earlier.field': 'Date and time',
  'earlier.save': 'Save meal',
  'earlier.noTime': 'Pick a date and a time.',
  'earlier.future': "That's still in the future.",
  'earlier.duplicate': 'You already logged a meal at that minute.',
  'earlier.added': 'Added a meal from {day} at {time}.',

  'goal.title': 'Fasting goal',
  'goal.hint': "Pick the window you're aiming for. You can change it anytime.",

  'settings.title': 'Settings',
  'settings.empty': 'Nothing logged yet. Everything you log stays in this browser, on this device.',
  'settings.summary': '{logged}. They live only in this browser, so export a backup now and then.',
  'settings.mealsCount': '{n} meal',
  'settings.mealsCountPlural': '{n} meals',
  'settings.caloriesCount': '{n} calorie entry',
  'settings.caloriesCountPlural': '{n} calorie entries',
  'settings.proteinCount': '{n} protein meal',
  'settings.proteinCountPlural': '{n} protein meals',
  'settings.export': 'Export backup',
  'settings.exportHint': 'Save your meals as a file.',
  'settings.import': 'Import backup',
  'settings.importHint': 'Adds meals from a Hearth file. Nothing is overwritten.',
  'settings.reminders': 'Reminders',
  'settings.remindersHint': 'Get told when your fast is done.',
  'settings.language': 'Language',
  'settings.languageHint': 'Now following your device.',
  'settings.languageHintFixed': 'Fixed to {language}.',
  'settings.about': 'About Hearth',
  'settings.aboutHint': 'Version and who made it.',
  'settings.erase': 'Erase everything',
  'settings.eraseHint': 'Deletes every meal on this device.',
  'settings.eraseConfirm': 'Tap again to erase everything',
  'settings.erased': 'Everything erased.',
  'settings.saved': 'Saved {file}.',
  'settings.imported': 'Imported {list}.',
  'settings.importedNothing': 'Everything in that file was already here.',
  'settings.listAnd': '{first} and {last}',

  'language.title': 'Language',
  'language.hint': 'Hearth follows your device unless you pick one.',
  'language.auto': 'Follow my device',
  'language.autoHint': 'Now: {language}',
  'language.en': 'English',
  'language.es': 'Español',
  'language.changed': 'Hearth is in English now.',

  'about.tagline': 'A cozy intermittent fasting timer.',
  'about.by': 'by',
  'about.privacy': 'Your meals never leave this device. No account, no sign-up.',
  'about.updates': 'Updates install on their own when you open the app.',
  'about.dev': 'Development build',
  'about.version': 'Version {id}',
  'about.versionDated': 'Version {id} · {date}',
  'about.updated': 'Hearth updated to {id}.',

  'reminders.title': 'Reminders',
  'reminders.hint': 'Hearth can tell you the moment your fast is done.',
  'reminders.toggle': 'Alert me at my goal',
  'reminders.unsupported': "This browser can't show notifications. Use the calendar below.",
  'reminders.blocked': 'Blocked. Allow notifications for this site in your browser settings.',
  'reminders.on': 'On. Alerts while Hearth is open or in the background.',
  'reminders.off': 'Off. Tap to turn the alarm on.',
  'reminders.calendar': 'Add this goal to my calendar',
  'reminders.calendarNoFast': 'Tap “I ate” first — a calendar alarm needs a fast in progress.',
  'reminders.calendarAt': 'Alarm at {time}, {day}. It rings even with Hearth closed.',
  'reminders.calendarPast': 'You already reached this goal.',
  'reminders.noNotifications': "This browser can't show notifications.",
  'reminders.deniedToast': 'Notifications are blocked for this site. Allow them in your browser settings.',
  'reminders.askToast': 'Allow notifications to hear the alarm.',
  'reminders.onToast': "Alarm on. You'll hear it at {hours}h.",
  'reminders.fileHint': 'Open the file to add the alarm to your calendar.',
  'reminders.shareTitle': 'Fasting goal',
  'notification.title': '{hours}h fast complete',
  'notification.body': 'Goal reached. Eat when you are ready, then tap “I ate”.',
  'ics.summary': 'Fasting goal reached ({hours}h)',
  'ics.description': 'Your {hours}h fast, started at {time} on {date}, is complete.',

  'backup.notJson': "That file isn't valid JSON.",
  'backup.notHearth': "That file isn't a Hearth backup.",
  'backup.damaged': 'The backup has {n} unreadable entries. Nothing was imported.',
  'backup.damagedOne': 'The backup has 1 unreadable entry. Nothing was imported.',

  'cal.noTarget': 'No target yet',
  'cal.setUp': 'Set up',
  'cal.setUpUnit': 'your numbers',
  'cal.eatenToday': 'kcal eaten today',
  'cal.unit': 'kcal',
  'cal.over': 'Over by',
  'cal.left': 'Left today',
  'cal.partTarget': 'Target',
  'cal.partEaten': 'Eaten',
  'cal.partBurned': 'Burned',
  'cal.numbersBtn': 'Your numbers',
  'cal.numbersBtnEmpty': 'Set up your numbers',
  'cal.addFood': 'Food',
  'cal.addExercise': 'Exercise',
  'cal.today': 'Today',
  'cal.todayEmpty': 'Nothing logged today. Add what you eat as you go.',
  'cal.earlier': 'Earlier days',
  'cal.earlierEmpty': 'Days you log will gather here.',
  'cal.kcal': '{n} kcal',
  'cal.kcalPlus': '+{n} kcal',
  'cal.dayEaten': '{n} eaten',
  'cal.dayEatenBurned': '{eaten} eaten, {burned} burned',
  'cal.dayUnder': '{n} under',
  'cal.dayOver': '{n} over',
  'cal.dayNet': '{n} net',
  'cal.deleteEntry': 'Delete {what} at {time}',
  'cal.removed': 'Removed {n} kcal.',
  'cal.logged': 'Logged {n} kcal.',
  'cal.loggedLeft': 'Logged. {n} kcal left today.',
  'cal.loggedOver': 'Logged. {n} kcal over today.',
  'cal.addFoodTitle': 'Add food',
  'cal.addExerciseTitle': 'Add exercise',
  'cal.addFoodHint': 'Search what you ate, or type the calories.',
  'cal.addExerciseHint': 'What you burned, from your watch or the machine. It goes back into the day.',
  'cal.mealName': 'Name this meal (optional)',
  'cal.whatWasIt': 'What was it? (optional)',
  'cal.mealPlaceholder': 'Lunch, snack…',
  'cal.exercisePlaceholder': 'Run, gym, walk…',
  'cal.calories': 'Calories',
  'cal.orCalories': 'Or type the calories',
  'cal.addTotal': 'Add {n} kcal',
  'cal.badNumber': 'Pick a food above, or enter a number between 1 and 10,000.',
  'cal.tooMuch': 'That meal adds up to more than 10,000 kcal. Check the grams.',
  'cal.tableFailed': 'The food table could not load. Type the calories instead.',
  'cal.per100': '{n} kcal per 100 g',

  'numbers.title': 'Your numbers',
  'numbers.hint': 'Used to estimate what you burn in a day. It stays on this device.',
  'numbers.sex': 'Sex',
  'numbers.female': 'Female',
  'numbers.male': 'Male',
  'numbers.age': 'Age',
  'numbers.height': 'Height (cm)',
  'numbers.weight': 'Weight (kg)',
  'numbers.activity': 'How active are you?',
  'numbers.weeklyGoal': 'Weekly goal',
  'numbers.ownTarget': 'Use my own target instead (optional)',
  'numbers.ownTargetPlaceholder': 'e.g. 1700',
  'numbers.fillFirst': 'Fill your age, height and weight to see an estimate.',
  'numbers.maintenance': 'Burned in a day',
  'numbers.deficit': 'Deficit',
  'numbers.none': 'none',
  'numbers.suggested': 'Suggested target',
  'numbers.clamped': 'That pace would put you under {n} kcal a day, so the target stays there.',
  'numbers.ownRange': 'A target of your own must be between 800 and 10,000 kcal.',
  'numbers.saved': 'Target set to {n} kcal a day.',
  'numbers.smallPrint':
    'Estimates for healthy adults, not medical advice. Check with a professional before a big change, and especially if you are pregnant, breastfeeding, or managing a health condition.',
  'numbers.keepWeight': 'Keep my weight',
  'numbers.lose': 'Lose {n} kg a week',
  'activity.sedentary': 'Mostly sitting',
  'activity.sedentaryHint': 'Desk work, little walking',
  'activity.light': 'Lightly active',
  'activity.lightHint': 'Light exercise 1–3 days a week',
  'activity.moderate': 'Moderately active',
  'activity.moderateHint': 'Exercise 3–5 days a week',
  'activity.active': 'Very active',
  'activity.activeHint': 'Hard exercise 6–7 days a week',
  'activity.intense': 'Extremely active',
  'activity.intenseHint': 'Physical job or two sessions a day',
  'validate.pickOne': 'Pick one.',
  'validate.age': 'Age between {min} and {max}.',
  'validate.height': 'Height between {min} and {max} cm.',
  'validate.weight': 'Weight between {min} and {max} kg.',

  'meal.breakfast': 'Breakfast',
  'meal.lunch': 'Lunch',
  'meal.dinner': 'Dinner',
  'meal.snack': 'Snack',

  'picker.addFoods': 'Add foods',
  'picker.placeholder': 'rice, pollo, banana…',
  'picker.recent': 'Recent',
  'picker.common': 'Common foods',
  'picker.nothing': 'Nothing found. Try another word, or type the number below.',
  'picker.total': 'Total {value}',
  'picker.addPortion': 'Add {portion} of {food}',
  'picker.gramsOf': 'Grams of {food}',
  'picker.remove': 'Remove {food}',
  'picker.hundred': '100 g',

  'protein.noGoal': 'No goal yet',
  'protein.setUp': 'Set up',
  'protein.setUpUnit': 'your goal',
  'protein.today': 'Protein today',
  'protein.eatenToday': 'g eaten today',
  'protein.ofGoal': 'of {n} g',
  'protein.reached': 'Goal reached',
  'protein.partGoal': 'Goal',
  'protein.partEaten': 'Eaten',
  'protein.partLeft': 'Left',
  'protein.goalBtn': 'Your goal',
  'protein.goalBtnEmpty': 'Set your goal',
  'protein.addMeal': 'Add a meal',
  'protein.todayTitle': 'Today',
  'protein.todayEmpty': 'Nothing logged today. Add a meal to see its protein.',
  'protein.earlier': 'Earlier days',
  'protein.earlierEmpty': 'Days you log will gather here.',
  'protein.rowTotal': '{n} protein',
  'protein.dayTotal': '{n} of protein',
  'protein.short': '{n} short',
  'protein.deleteMeal': 'Delete the meal at {time}',
  'protein.removed': 'Removed {n} of protein.',
  'protein.logged': 'Logged {n} of protein.',
  'protein.loggedLeft': 'Logged. {n} to go today.',
  'protein.loggedReached': 'Logged. {n} today — goal reached.',
  'protein.dialogTitle': 'Add a meal',
  'protein.dialogHint': 'Search what you ate. Each food shows its protein, and the meal shows the total.',
  'protein.orType': 'Or type the protein',
  'protein.save': 'Add meal',
  'protein.addTotal': 'Add {n}',
  'protein.badNumber': 'Pick a food above, or enter between {min} and {max} g.',
  'protein.tooMuch': 'That meal adds up to more than {max} g. Check the grams.',
  'protein.tableFailed': 'The food table could not load. Type the grams of protein instead.',
  'protein.per100': '{n} protein per 100 g',
  'protein.goalTitle': 'Protein goal',
  'protein.goalHint': 'Worked out from your weight, or type your own number.',
  'protein.perKg': 'Grams per kilo',
  'protein.ownGoal': 'Use my own goal instead (optional)',
  'protein.ownGoalPlaceholder': 'e.g. 130',
  'protein.fillWeight': 'Fill your weight to see a suggested goal.',
  'protein.preview': '{weight} kg × {perKg} g',
  'protein.previewValue': '{n} g a day',
  'protein.goalSaved': 'Goal set to {n} g of protein a day.',
  'protein.goalNeeded': 'Enter your weight, or a goal of your own.',
  'protein.goalRange': 'A goal must be between {min} and {max} g, and a weight between 30 and 300 kg.',
  'protein.smallPrint': 'A guide for healthy adults, not medical advice. Check with a professional before a big change, especially with a kidney condition.',
  'perKg.basic': 'Basic need',
  'perKg.basicHint': 'What an adult needs to stay healthy',
  'perKg.active': 'Active',
  'perKg.activeHint': 'Regular training, staying at your weight',
  'perKg.muscle': 'Building muscle',
  'perKg.muscleHint': 'Strength training, or losing fat',
  'perKg.high': 'High',
  'perKg.highHint': 'Hard training with a calorie deficit',
  'perKg.option': '{n} g · {label}',

  'aria.screens': 'Screens',
  'aria.currentFast': 'Current fast',
  'aria.stats': 'Your stats',
  'aria.caloriesToday': 'Calories today',
  'aria.proteinToday': 'Protein today',
  'aria.settings': 'Settings',
  'aria.footer': 'Your logs stay on this device.',
}

const ES = {
  'common.cancel': 'Cancelar',
  'common.close': 'Cerrar',
  'common.save': 'Guardar',
  'common.done': 'Listo',
  'common.undo': 'Deshacer',
  'common.today': 'Hoy',
  'common.yesterday': 'Ayer',
  'common.grams': '{n} g',

  'tab.fasting': 'Ayuno',
  'tab.calories': 'Calorías',
  'tab.protein': 'Proteína',

  'greeting.morning': 'Buenos días',
  'greeting.afternoon': 'Buenas tardes',
  'greeting.evening': 'Buenas noches',
  'greeting.night': 'Buenas noches',

  'storage.blocked': 'Este navegador no deja que Hearth guarde. Tus registros desaparecerán al cerrarlo.',
  'storage.refused': 'Este navegador no deja que Hearth guarde.',

  'duration.hoursMinutes': '{h} h {m} min',
  'duration.hours': '{h} h',
  'duration.minutes': '{m} min',

  'fast.hoursFasted': 'horas de ayuno',
  'fast.idleTitle': 'Cuando quieras',
  'fast.idleHint': 'Toca “Ya comí” al terminar de comer.',
  'fast.ate': 'Ya comí',
  'fast.aria': '{duration} de ayuno',
  'fast.stage0': 'Recién comiste. Disfruta.',
  'fast.stage1': 'Ya vas agarrando ritmo.',
  'fast.stage2': 'Vas firme y tranquilo.',
  'fast.stage3': 'Ya casi. Aguanta con calma.',
  'fast.stage4': 'Meta cumplida. Muy bien.',
  'fast.lastMeal': 'Última comida · {day} a las {time}',
  'fast.goalChip': 'Meta {hours} h',
  'fast.goalToGo': '{goal} · faltan {left}',
  'fast.goalReached': '{goal} · cumplida, +{over}',
  'fast.statLongest': 'Ayuno más largo',
  'fast.statAverage': 'Promedio 7 días',
  'fast.statCount': 'Comidas registradas',
  'fast.historyTitle': 'Comidas recientes',
  'fast.historyEmpty': 'Todavía no hay nada. Aquí se juntarán tus comidas.',
  'fast.showOlder': 'Ver comidas anteriores',
  'fast.firstMeal': 'Primera comida registrada',
  'fast.afterFast': 'tras un ayuno de {duration}',
  'fast.deleteMeal': 'Borrar la comida de {day} a las {time}',
  'fast.alreadyLogged': 'Ya está registrada. Disfruta tu comida.',
  'fast.loggedFirst': 'Registrada a las {time}. El reloj arrancó.',
  'fast.loggedAfter': 'Registrada a las {time}, tras un ayuno de {duration}.',
  'fast.removed': 'Se quitó la comida de las {time}.',
  'fast.forgot': '¿Olvidaste marcar? Registra una comida anterior',

  'earlier.title': '¿A qué hora comiste?',
  'earlier.hint': 'Para una comida que olvidaste marcar. El reloj sigue desde la más reciente.',
  'earlier.field': 'Fecha y hora',
  'earlier.save': 'Guardar comida',
  'earlier.noTime': 'Elige una fecha y una hora.',
  'earlier.future': 'Esa hora todavía no llega.',
  'earlier.duplicate': 'Ya registraste una comida en ese minuto.',
  'earlier.added': 'Se agregó una comida de {day} a las {time}.',

  'goal.title': 'Meta de ayuno',
  'goal.hint': 'Elige la ventana que buscas. Puedes cambiarla cuando quieras.',

  'settings.title': 'Ajustes',
  'settings.empty': 'Todavía no hay nada. Todo lo que registres se queda en este navegador, en este dispositivo.',
  'settings.summary': '{logged}. Viven solo en este navegador, así que exporta un respaldo de vez en cuando.',
  'settings.mealsCount': '{n} comida',
  'settings.mealsCountPlural': '{n} comidas',
  'settings.caloriesCount': '{n} registro de calorías',
  'settings.caloriesCountPlural': '{n} registros de calorías',
  'settings.proteinCount': '{n} comida con proteína',
  'settings.proteinCountPlural': '{n} comidas con proteína',
  'settings.export': 'Exportar respaldo',
  'settings.exportHint': 'Guarda tus registros en un archivo.',
  'settings.import': 'Importar respaldo',
  'settings.importHint': 'Agrega lo que traiga el archivo. No borra nada.',
  'settings.reminders': 'Recordatorios',
  'settings.remindersHint': 'Que te avise cuando termine tu ayuno.',
  'settings.language': 'Idioma',
  'settings.languageHint': 'Ahora sigue a tu dispositivo.',
  'settings.languageHintFixed': 'Fijado en {language}.',
  'settings.about': 'Acerca de Hearth',
  'settings.aboutHint': 'Versión y quién la hizo.',
  'settings.erase': 'Borrar todo',
  'settings.eraseHint': 'Elimina todos los registros de este dispositivo.',
  'settings.eraseConfirm': 'Toca otra vez para borrar todo',
  'settings.erased': 'Se borró todo.',
  'settings.saved': 'Se guardó {file}.',
  'settings.imported': 'Se importaron {list}.',
  'settings.importedNothing': 'Todo lo de ese archivo ya estaba aquí.',
  'settings.listAnd': '{first} y {last}',

  'language.title': 'Idioma',
  'language.hint': 'Hearth sigue a tu dispositivo, salvo que elijas uno.',
  'language.auto': 'Seguir a mi dispositivo',
  'language.autoHint': 'Ahora: {language}',
  'language.en': 'English',
  'language.es': 'Español',
  'language.changed': 'Hearth ya está en español.',

  'about.tagline': 'Un contador de ayuno intermitente, con calma.',
  'about.by': 'por',
  'about.privacy': 'Tus registros no salen de este dispositivo. Sin cuenta, sin registro.',
  'about.updates': 'Las actualizaciones llegan solas al abrir la app.',
  'about.dev': 'Versión de desarrollo',
  'about.version': 'Versión {id}',
  'about.versionDated': 'Versión {id} · {date}',
  'about.updated': 'Hearth se actualizó a {id}.',

  'reminders.title': 'Recordatorios',
  'reminders.hint': 'Hearth puede avisarte apenas termine tu ayuno.',
  'reminders.toggle': 'Avísame al cumplir la meta',
  'reminders.unsupported': 'Este navegador no puede mostrar notificaciones. Usa el calendario de abajo.',
  'reminders.blocked': 'Bloqueadas. Permite las notificaciones de este sitio en los ajustes del navegador.',
  'reminders.on': 'Activada. Suena con Hearth abierta o en segundo plano.',
  'reminders.off': 'Apagada. Toca para activar la alarma.',
  'reminders.calendar': 'Agregar esta meta a mi calendario',
  'reminders.calendarNoFast': 'Primero toca “Ya comí”: la alarma del calendario necesita un ayuno en curso.',
  'reminders.calendarAt': 'Alarma a las {time}, {day}. Suena incluso con Hearth cerrada.',
  'reminders.calendarPast': 'Ya cumpliste esta meta.',
  'reminders.noNotifications': 'Este navegador no puede mostrar notificaciones.',
  'reminders.deniedToast': 'Las notificaciones están bloqueadas para este sitio. Permítelas en los ajustes del navegador.',
  'reminders.askToast': 'Permite las notificaciones para oír la alarma.',
  'reminders.onToast': 'Alarma activada. Sonará a las {hours} h.',
  'reminders.fileHint': 'Abre el archivo para agregar la alarma a tu calendario.',
  'reminders.shareTitle': 'Meta de ayuno',
  'notification.title': 'Ayuno de {hours} h completo',
  'notification.body': 'Meta cumplida. Come cuando quieras y toca “Ya comí”.',
  'ics.summary': 'Meta de ayuno cumplida ({hours} h)',
  'ics.description': 'Tu ayuno de {hours} h, que empezó a las {time} del {date}, está completo.',

  'backup.notJson': 'Ese archivo no es un JSON válido.',
  'backup.notHearth': 'Ese archivo no es un respaldo de Hearth.',
  'backup.damaged': 'El respaldo tiene {n} registros ilegibles. No se importó nada.',
  'backup.damagedOne': 'El respaldo tiene 1 registro ilegible. No se importó nada.',

  'cal.noTarget': 'Sin objetivo',
  'cal.setUp': 'Configura',
  'cal.setUpUnit': 'tus datos',
  'cal.eatenToday': 'kcal comidas hoy',
  'cal.unit': 'kcal',
  'cal.over': 'Te pasaste',
  'cal.left': 'Te quedan hoy',
  'cal.partTarget': 'Objetivo',
  'cal.partEaten': 'Comido',
  'cal.partBurned': 'Quemado',
  'cal.numbersBtn': 'Tus datos',
  'cal.numbersBtnEmpty': 'Configura tus datos',
  'cal.addFood': 'Comida',
  'cal.addExercise': 'Ejercicio',
  'cal.today': 'Hoy',
  'cal.todayEmpty': 'Nada registrado hoy. Ve agregando lo que comes.',
  'cal.earlier': 'Días anteriores',
  'cal.earlierEmpty': 'Aquí se juntarán los días que registres.',
  'cal.kcal': '{n} kcal',
  'cal.kcalPlus': '+{n} kcal',
  'cal.dayEaten': '{n} comidas',
  'cal.dayEatenBurned': '{eaten} comidas, {burned} quemadas',
  'cal.dayUnder': '{n} por debajo',
  'cal.dayOver': '{n} de más',
  'cal.dayNet': '{n} netas',
  'cal.deleteEntry': 'Borrar {what} de las {time}',
  'cal.removed': 'Se quitaron {n} kcal.',
  'cal.logged': 'Registradas {n} kcal.',
  'cal.loggedLeft': 'Registrado. Te quedan {n} kcal hoy.',
  'cal.loggedOver': 'Registrado. Te pasaste por {n} kcal hoy.',
  'cal.addFoodTitle': 'Agregar comida',
  'cal.addExerciseTitle': 'Agregar ejercicio',
  'cal.addFoodHint': 'Busca lo que comiste, o escribe las calorías.',
  'cal.addExerciseHint': 'Lo que quemaste, según tu reloj o la máquina. Vuelve al día.',
  'cal.mealName': 'Nombre de la comida (opcional)',
  'cal.whatWasIt': '¿Qué fue? (opcional)',
  'cal.mealPlaceholder': 'Almuerzo, snack…',
  'cal.exercisePlaceholder': 'Correr, gym, caminar…',
  'cal.calories': 'Calorías',
  'cal.orCalories': 'O escribe las calorías',
  'cal.addTotal': 'Agregar {n} kcal',
  'cal.badNumber': 'Elige un alimento arriba, o escribe un número entre 1 y 10.000.',
  'cal.tooMuch': 'Esa comida suma más de 10.000 kcal. Revisa los gramos.',
  'cal.tableFailed': 'No se pudo cargar la tabla de alimentos. Escribe las calorías.',
  'cal.per100': '{n} kcal por 100 g',

  'numbers.title': 'Tus datos',
  'numbers.hint': 'Sirven para estimar lo que gastas al día. Se quedan en este dispositivo.',
  'numbers.sex': 'Sexo',
  'numbers.female': 'Mujer',
  'numbers.male': 'Hombre',
  'numbers.age': 'Edad',
  'numbers.height': 'Estatura (cm)',
  'numbers.weight': 'Peso (kg)',
  'numbers.activity': '¿Qué tan activo eres?',
  'numbers.weeklyGoal': 'Meta semanal',
  'numbers.ownTarget': 'Usar mi propio objetivo (opcional)',
  'numbers.ownTargetPlaceholder': 'ej. 1700',
  'numbers.fillFirst': 'Completa tu edad, estatura y peso para ver la estimación.',
  'numbers.maintenance': 'Gasto del día',
  'numbers.deficit': 'Déficit',
  'numbers.none': 'ninguno',
  'numbers.suggested': 'Objetivo sugerido',
  'numbers.clamped': 'A ese ritmo quedarías bajo {n} kcal al día, así que el objetivo se queda ahí.',
  'numbers.ownRange': 'Un objetivo propio debe estar entre 800 y 10.000 kcal.',
  'numbers.saved': 'Objetivo fijado en {n} kcal al día.',
  'numbers.smallPrint':
    'Son estimaciones para adultos sanos, no consejo médico. Consulta a un profesional antes de un cambio grande, y sobre todo en embarazo, lactancia o con alguna condición de salud.',
  'numbers.keepWeight': 'Mantener mi peso',
  'numbers.lose': 'Bajar {n} kg por semana',
  'activity.sedentary': 'Sobre todo sentado',
  'activity.sedentaryHint': 'Trabajo de escritorio, poca caminata',
  'activity.light': 'Poco activo',
  'activity.lightHint': 'Ejercicio suave 1 a 3 días por semana',
  'activity.moderate': 'Moderadamente activo',
  'activity.moderateHint': 'Ejercicio 3 a 5 días por semana',
  'activity.active': 'Muy activo',
  'activity.activeHint': 'Ejercicio fuerte 6 o 7 días por semana',
  'activity.intense': 'Activo al extremo',
  'activity.intenseHint': 'Trabajo físico o dos sesiones al día',
  'validate.pickOne': 'Elige una.',
  'validate.age': 'Edad entre {min} y {max}.',
  'validate.height': 'Estatura entre {min} y {max} cm.',
  'validate.weight': 'Peso entre {min} y {max} kg.',

  'meal.breakfast': 'Desayuno',
  'meal.lunch': 'Almuerzo',
  'meal.dinner': 'Cena',
  'meal.snack': 'Snack',

  'picker.addFoods': 'Agregar alimentos',
  'picker.placeholder': 'arroz, pollo, huevo…',
  'picker.recent': 'Recientes',
  'picker.common': 'Alimentos comunes',
  'picker.nothing': 'No se encontró. Prueba otra palabra, o escribe el número abajo.',
  'picker.total': 'Total {value}',
  'picker.addPortion': 'Agregar {portion} de {food}',
  'picker.gramsOf': 'Gramos de {food}',
  'picker.remove': 'Quitar {food}',
  'picker.hundred': '100 g',

  'protein.noGoal': 'Sin meta',
  'protein.setUp': 'Configura',
  'protein.setUpUnit': 'tu meta',
  'protein.today': 'Proteína de hoy',
  'protein.eatenToday': 'g comidos hoy',
  'protein.ofGoal': 'de {n} g',
  'protein.reached': 'Meta cumplida',
  'protein.partGoal': 'Meta',
  'protein.partEaten': 'Comido',
  'protein.partLeft': 'Falta',
  'protein.goalBtn': 'Tu meta',
  'protein.goalBtnEmpty': 'Fija tu meta',
  'protein.addMeal': 'Agregar comida',
  'protein.todayTitle': 'Hoy',
  'protein.todayEmpty': 'Nada registrado hoy. Agrega una comida para ver su proteína.',
  'protein.earlier': 'Días anteriores',
  'protein.earlierEmpty': 'Aquí se juntarán los días que registres.',
  'protein.rowTotal': '{n} de proteína',
  'protein.dayTotal': '{n} de proteína',
  'protein.short': 'faltaron {n}',
  'protein.deleteMeal': 'Borrar la comida de las {time}',
  'protein.removed': 'Se quitaron {n} de proteína.',
  'protein.logged': 'Registrados {n} de proteína.',
  'protein.loggedLeft': 'Registrado. Te faltan {n} hoy.',
  'protein.loggedReached': 'Registrado. {n} hoy: meta cumplida.',
  'protein.dialogTitle': 'Agregar comida',
  'protein.dialogHint': 'Busca lo que comiste. Cada alimento muestra su proteína, y la comida muestra el total.',
  'protein.orType': 'O escribe la proteína',
  'protein.save': 'Agregar comida',
  'protein.addTotal': 'Agregar {n}',
  'protein.badNumber': 'Elige un alimento arriba, o escribe entre {min} y {max} g.',
  'protein.tooMuch': 'Esa comida suma más de {max} g. Revisa los gramos.',
  'protein.tableFailed': 'No se pudo cargar la tabla de alimentos. Escribe los gramos de proteína.',
  'protein.per100': '{n} de proteína por 100 g',
  'protein.goalTitle': 'Meta de proteína',
  'protein.goalHint': 'Se calcula con tu peso, o escribe tu propio número.',
  'protein.perKg': 'Gramos por kilo',
  'protein.ownGoal': 'Usar mi propia meta (opcional)',
  'protein.ownGoalPlaceholder': 'ej. 130',
  'protein.fillWeight': 'Completa tu peso para ver una meta sugerida.',
  'protein.preview': '{weight} kg × {perKg} g',
  'protein.previewValue': '{n} g al día',
  'protein.goalSaved': 'Meta fijada en {n} g de proteína al día.',
  'protein.goalNeeded': 'Escribe tu peso, o una meta propia.',
  'protein.goalRange': 'La meta debe estar entre {min} y {max} g, y el peso entre 30 y 300 kg.',
  'protein.smallPrint': 'Es una guía para adultos sanos, no consejo médico. Consulta a un profesional antes de un cambio grande, sobre todo con alguna condición renal.',
  'perKg.basic': 'Necesidad básica',
  'perKg.basicHint': 'Lo que un adulto necesita para estar bien',
  'perKg.active': 'Activo',
  'perKg.activeHint': 'Entrenas seguido y mantienes tu peso',
  'perKg.muscle': 'Ganar músculo',
  'perKg.muscleHint': 'Entrenas fuerza, o estás bajando grasa',
  'perKg.high': 'Alto',
  'perKg.highHint': 'Entrenamiento duro con déficit de calorías',
  'perKg.option': '{n} g · {label}',

  'aria.screens': 'Pantallas',
  'aria.currentFast': 'Ayuno actual',
  'aria.stats': 'Tus cifras',
  'aria.caloriesToday': 'Calorías de hoy',
  'aria.proteinToday': 'Proteína de hoy',
  'aria.settings': 'Ajustes',
  'aria.footer': 'Tus registros se quedan en este dispositivo.',
}

const DICTIONARIES = { en: EN, es: ES }
// What Intl gets. The device's own tag is used when it matches the language,
// so a phone set to es-EC keeps its own date and number habits.
const FALLBACK_LOCALE = { en: 'en-US', es: 'es-ES' }

let preference = 'auto'
let current = DEFAULT
let currentLocale = FALLBACK_LOCALE[DEFAULT]
const listeners = []

function deviceTags() {
  if (typeof navigator === 'undefined') return []
  const tags = Array.isArray(navigator.languages) && navigator.languages.length ? navigator.languages : [navigator.language]
  return tags.filter(Boolean)
}

// The first tag we understand wins; anything else falls back to English.
export function detectLanguage(tags = deviceTags()) {
  for (const tag of tags) {
    const base = String(tag).toLowerCase().split('-')[0]
    if (LANGUAGES.includes(base)) return base
  }
  return DEFAULT
}

function localeFor(language, tags = deviceTags()) {
  const match = tags.find((tag) => String(tag).toLowerCase().split('-')[0] === language)
  return match || FALLBACK_LOCALE[language]
}

function readPreference() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'en' || saved === 'es' ? saved : 'auto'
  } catch {
    return 'auto'
  }
}

function apply(language) {
  current = LANGUAGES.includes(language) ? language : DEFAULT
  currentLocale = localeFor(current)
  if (typeof document !== 'undefined') document.documentElement.lang = current
  for (const listener of listeners) listener(current)
}

export function initLanguage() {
  preference = readPreference()
  apply(preference === 'auto' ? detectLanguage() : preference)
}

export function language() {
  return current
}

export function languagePreference() {
  return preference
}

export function locale() {
  return currentLocale
}

export function setLanguagePreference(next) {
  preference = next === 'en' || next === 'es' ? next : 'auto'
  try {
    if (preference === 'auto') localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, preference)
  } catch {
    /* the choice still applies to this session */
  }
  apply(preference === 'auto' ? detectLanguage() : preference)
}

// For the tests, and for anything that needs a language without touching storage.
export function setLanguage(language) {
  apply(language)
}

export function onLanguageChange(listener) {
  listeners.push(listener)
}

export function t(key, params) {
  const dictionary = DICTIONARIES[current] || EN
  const template = dictionary[key] ?? EN[key]
  if (template === undefined) return key
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (whole, name) => (name in params ? String(params[name]) : whole))
}

export function dictionaries() {
  return DICTIONARIES
}

// Static text in index.html carries its key in data-i18n, so the markup stays
// readable and nothing has to be rebuilt to switch languages.
export function applyStaticText(root = document) {
  for (const node of root.querySelectorAll('[data-i18n]')) node.textContent = t(node.dataset.i18n)
  for (const node of root.querySelectorAll('[data-i18n-placeholder]')) node.placeholder = t(node.dataset.i18nPlaceholder)
  for (const node of root.querySelectorAll('[data-i18n-aria]')) node.setAttribute('aria-label', t(node.dataset.i18nAria))
}

initLanguage()
