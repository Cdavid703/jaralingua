"""Generate the public First Visit vocabulary scripts with the story's Sarah voice."""
import generate_first_visit_audio as generator
if __name__ == '__main__':
    generator.DEST = generator.ROOT / 'ingles/intermediate-2/audio/unit-5-first-visit/vocabulary'
    generator.main()
