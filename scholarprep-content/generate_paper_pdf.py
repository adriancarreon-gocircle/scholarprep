"""
Generic ScholarPrep Practice Paper PDF generator.
Usage: python3 generate_paper_pdf.py <paper.json> <output.pdf>

Produces: cover page, table of contents, numbered subject sections
(with reading passages where present), then an answer key at the back.
"""
import json
import sys
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import simpleSplit

NAVY = HexColor('#1e1b4b')
INDIGO = HexColor('#4338CA')
GREY = HexColor('#94A3B8')
LIGHT = HexColor('#E5E7EB')
DARK = HexColor('#0F172A')
GREEN = HexColor('#059669')

W, H = A4
MARGIN = 20 * mm


def wrap_text(c, text, font, size, max_width):
    return simpleSplit(text, font, size, max_width)


def draw_header_footer(c, title, page_num, total_pages):
    c.setFillColor(GREY)
    c.setFont("Helvetica", 8)
    c.drawString(MARGIN, H - 12 * mm, title)
    c.drawRightString(W - MARGIN, H - 12 * mm, "scholarprep.com.au")
    c.setStrokeColor(LIGHT)
    c.setLineWidth(0.5)
    c.line(MARGIN, H - 15 * mm, W - MARGIN, H - 15 * mm)
    c.drawCentredString(W / 2, 12 * mm, f"Page {page_num}")


def cover_page(c, paper):
    c.setFillColor(NAVY)
    c.rect(0, 0, W, H, fill=1, stroke=0)

    c.setFillColor(HexColor('#ffffff'))
    c.setFont("Helvetica-Bold", 15)
    c.drawCentredString(W / 2, H - 55 * mm, "ScholarPrep")

    c.setFont("Helvetica-Bold", 30)
    title_lines = wrap_text(c, paper['title'], "Helvetica-Bold", 30, W - 2 * MARGIN)
    y = H - 100 * mm
    for line in title_lines:
        c.drawCentredString(W / 2, y, line)
        y -= 12 * mm

    c.setFont("Helvetica", 14)
    c.setFillColor(HexColor('#C7D2FE'))
    c.drawCentredString(W / 2, y - 8 * mm, f"Level {paper['level']}  \u00b7  {paper['examStyle']}")

    # Subject badge row
    badge_y = y - 30 * mm
    subjects = [s['subject'] for s in paper['sections']]
    total_q = sum(len(s['questions']) for s in paper['sections'])
    c.setFont("Helvetica", 11)
    c.setFillColor(HexColor('#A5B4FC'))
    c.drawCentredString(W / 2, badge_y, "  \u2022  ".join(subjects))
    c.setFont("Helvetica", 10)
    c.setFillColor(GREY)
    c.drawCentredString(W / 2, badge_y - 10 * mm, f"{total_q} questions  \u00b7  Full worked answer key included")

    c.setFont("Helvetica", 9)
    c.setFillColor(HexColor('#6366F1'))
    c.drawCentredString(W / 2, 30 * mm, "\u00a9 Go Circle Pty Ltd \u2014 scholarprep.com.au")
    c.showPage()


def contents_page(c, paper, section_start_pages):
    c.setFillColor(DARK)
    c.setFont("Helvetica-Bold", 22)
    c.drawString(MARGIN, H - 40 * mm, "Contents")
    c.setStrokeColor(LIGHT)
    c.line(MARGIN, H - 45 * mm, W - MARGIN, H - 45 * mm)

    y = H - 60 * mm
    c.setFont("Helvetica", 13)
    for i, section in enumerate(paper['sections']):
        c.setFillColor(DARK)
        c.drawString(MARGIN, y, f"{section['subject']}")
        c.setFillColor(GREY)
        c.drawString(MARGIN + 70 * mm, y, f"{len(section['questions'])} questions")
        c.drawRightString(W - MARGIN, y, f"Page {section_start_pages[i]}")
        y -= 12 * mm

    c.setFillColor(DARK)
    c.drawString(MARGIN, y, "Answer Key")
    c.drawRightString(W - MARGIN, y, f"Page {section_start_pages[-1] + 1}")

    y -= 20 * mm
    c.setStrokeColor(LIGHT)
    box_h = 30 * mm
    c.roundRect(MARGIN, y - box_h, W - 2 * MARGIN, box_h, 3 * mm, stroke=1, fill=0)
    c.setFont("Helvetica-Bold", 10)
    c.setFillColor(INDIGO)
    c.drawString(MARGIN + 6 * mm, y - 8 * mm, "INSTRUCTIONS")
    c.setFont("Helvetica", 9.5)
    c.setFillColor(DARK)
    instr_lines = [
        "Work through each section in order. Read each question carefully before answering.",
        "Circle or write your chosen answer (A, B, C or D) in the space provided.",
        "Check your answers against the Answer Key at the back once you have finished.",
    ]
    iy = y - 15 * mm
    for line in instr_lines:
        c.drawString(MARGIN + 6 * mm, iy, line)
        iy -= 6 * mm

    c.showPage()


def question_block(c, y, q_num, question, font_size=10.5):
    """Draws one question with 4 options. Returns new y position."""
    max_width = W - 2 * MARGIN - 8 * mm
    c.setFont("Helvetica-Bold", font_size)
    c.setFillColor(DARK)
    q_lines = wrap_text(c, f"{q_num}.  {question['text']}", "Helvetica-Bold", font_size, max_width)
    for line in q_lines:
        c.drawString(MARGIN, y, line)
        y -= 5.5 * mm
    y -= 1 * mm

    c.setFont("Helvetica", font_size - 0.5)
    for letter in ['A', 'B', 'C', 'D']:
        opt_text = f"     {letter})  {question['options'][letter]}"
        opt_lines = wrap_text(c, opt_text, "Helvetica", font_size - 0.5, max_width)
        for line in opt_lines:
            c.drawString(MARGIN, y, line)
            y -= 5 * mm
    y -= 4 * mm
    return y


def section_pages(c, section, title_for_header, page_counter, total_pages, q_num_start=1):
    start_page = page_counter[0]

    # Section title page
    c.setFillColor(INDIGO)
    c.rect(0, H - 40 * mm, W, 40 * mm, fill=1, stroke=0)
    c.setFillColor(HexColor('#ffffff'))
    c.setFont("Helvetica-Bold", 26)
    c.drawString(MARGIN, H - 25 * mm, section['subject'])
    c.setFont("Helvetica", 11)
    c.setFillColor(HexColor('#C7D2FE'))
    instr_lines = wrap_text(c, section['instructions'], "Helvetica", 11, W - 2 * MARGIN)
    y = H - 55 * mm
    c.setFillColor(DARK)
    c.setFont("Helvetica", 10.5)
    for line in instr_lines:
        c.drawString(MARGIN, y, line)
        y -= 5.5 * mm
    y -= 6 * mm

    # Reading passage if present
    q_offset = 0
    if 'passage' in section:
        c.setFont("Helvetica-Bold", 13)
        c.setFillColor(DARK)
        c.drawString(MARGIN, y, section['passage']['title'])
        y -= 8 * mm
        c.setFont("Helvetica", 9.5)
        paragraphs = section['passage']['text'].split('\n\n')
        for p_idx, paragraph in enumerate(paragraphs):
            para_lines = wrap_text(c, paragraph, "Helvetica", 9.5, W - 2 * MARGIN)
            for line in para_lines:
                if y < 30 * mm:
                    draw_header_footer(c, title_for_header, page_counter[0], total_pages)
                    page_counter[0] += 1
                    c.showPage()
                    y = H - 20 * mm
                c.drawString(MARGIN, y, line)
                y -= 5 * mm
            if p_idx < len(paragraphs) - 1:
                y -= 2.5 * mm
        y -= 8 * mm

    q_num = q_num_start
    for question in section['questions']:
        # Check remaining space, start new page if needed
        est_height = 45 * mm
        if y < est_height:
            draw_header_footer(c, title_for_header, page_counter[0], total_pages)
            page_counter[0] += 1
            c.showPage()
            y = H - 20 * mm
        y = question_block(c, y, q_num, question)
        q_num += 1

    draw_header_footer(c, title_for_header, page_counter[0], total_pages)
    page_counter[0] += 1
    c.showPage()

    return start_page


def answer_key_pages(c, paper, page_counter, total_pages):
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 22)
    c.drawString(MARGIN, H - 30 * mm, "Answer Key")
    c.setStrokeColor(LIGHT)
    c.line(MARGIN, H - 35 * mm, W - MARGIN, H - 35 * mm)

    y = H - 48 * mm
    global_q = 1
    for section in paper['sections']:
        if y < 40 * mm:
            draw_header_footer(c, "Answer Key", page_counter[0], total_pages)
            page_counter[0] += 1
            c.showPage()
            y = H - 20 * mm

        c.setFont("Helvetica-Bold", 13)
        c.setFillColor(INDIGO)
        c.drawString(MARGIN, y, section['subject'])
        y -= 8 * mm

        for question in section['questions']:
            if y < 30 * mm:
                draw_header_footer(c, "Answer Key", page_counter[0], total_pages)
                page_counter[0] += 1
                c.showPage()
                y = H - 20 * mm

            c.setFont("Helvetica-Bold", 10)
            c.setFillColor(GREEN)
            c.drawString(MARGIN, y, f"{global_q}. {question['correct']}")
            c.setFont("Helvetica", 9)
            c.setFillColor(HexColor('#475569'))
            exp_lines = wrap_text(c, question['explanation'], "Helvetica", 9, W - 2 * MARGIN - 20 * mm)
            first = True
            for line in exp_lines:
                if first:
                    c.drawString(MARGIN + 18 * mm, y, line)
                    first = False
                else:
                    y -= 4.5 * mm
                    c.drawString(MARGIN + 18 * mm, y, line)
            y -= 6.5 * mm
            global_q += 1
        y -= 4 * mm

    draw_header_footer(c, "Answer Key", page_counter[0], total_pages)
    page_counter[0] += 1
    c.showPage()


def render_body(c, paper, start_pages_out):
    """Renders cover + contents (using start_pages_out for page refs) + sections
    + answer key. start_pages_out must already contain the real page numbers
    (call this twice: first with a scratch canvas to discover them, then for real)."""
    page_counter = [3]  # page 1 = cover, page 2 = contents, sections start at 3
    cover_page(c, paper)
    contents_page(c, paper, start_pages_out)
    q_num = 1
    for section in paper['sections']:
        section_pages(c, section, f"{paper['title']} \u2014 {section['subject']}", page_counter, 0, q_num)
        q_num += len(section['questions'])
    answer_key_pages(c, paper, page_counter, 0)
    return page_counter[0] - 1


def generate(paper_path, output_path):
    with open(paper_path) as f:
        paper = json.load(f)

    # ── Pass 1: render to a throwaway canvas just to discover real page numbers ──
    scratch = canvas.Canvas('/tmp/_scratch_paper.pdf', pagesize=A4)
    page_counter = [3]
    cover_page(scratch, paper)
    # Draw a placeholder contents page (numbers don't matter here, just need page 2 consumed)
    contents_page(scratch, paper, [3] * (len(paper['sections']) + 1))
    real_start_pages = []
    q_num = 1
    for section in paper['sections']:
        start = section_pages(scratch, section, f"{paper['title']} \u2014 {section['subject']}", page_counter, 0, q_num)
        real_start_pages.append(start)
        q_num += len(section['questions'])
    real_start_pages.append(page_counter[0])  # answer key start page
    scratch.save()

    # ── Pass 2: render the real PDF with accurate contents page numbers ─────────
    c = canvas.Canvas(output_path, pagesize=A4)
    total_pages = render_body(c, paper, real_start_pages)
    c.save()
    print(f"Generated {output_path} ({total_pages} pages)")


if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: python3 generate_paper_pdf.py <paper.json> <output.pdf>")
        sys.exit(1)
    generate(sys.argv[1], sys.argv[2])
