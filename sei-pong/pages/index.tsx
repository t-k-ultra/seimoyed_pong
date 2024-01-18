import {
  Container, Flex
} from '@chakra-ui/react';
import { WalletSection, Pong } from '../components';

export default function Home() {
  return (
    <Container maxW="10xl" py={5}>
      <Flex justifyContent="flex-end"> {/* Aligns content to the right */}
        <WalletSection />
      </Flex>
      <Pong />
    </Container>
  );
}
