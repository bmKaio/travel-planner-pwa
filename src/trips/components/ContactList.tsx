import type { Contact } from '../types'
import PhoneLink from './PhoneLink'

function ContactList({ contacts }: { contacts: Contact[] }) {
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="text-xl font-bold">Contactos del grupo</h2>
      <ul className="rounded-[20px] border border-trip-line bg-trip-card px-4">
        {contacts.map((contact) => (
          <li
            key={`${contact.name}-${contact.role}`}
            className="flex items-center gap-3.5 border-t border-trip-line py-3.5 first:border-t-0"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="text-[17px] font-semibold">{contact.name}</p>
              <p className="text-[15px] text-trip-muted">{contact.role}</p>
            </div>
            {contact.phone && (
              <PhoneLink number={contact.phone} variant="secondary" icon={false} className="px-3.5">
                <span aria-hidden="true">Llamar</span>
                <span className="sr-only">Llamar a {contact.name}</span>
              </PhoneLink>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default ContactList
