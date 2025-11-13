abstract class A {
  call(phone: string) {}
  abstract dial(phone: string): void
}

class B implements A {}
